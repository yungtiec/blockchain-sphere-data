const Promise = require("bluebird");
const _ = require("lodash");
const csvParse = require("csv-parse");
const csvParseSync = require("csv-parse/lib/sync");
const parse = Promise.promisify(csvParse);
const csvWriter = require("csv-write-stream");
const fs = require("fs");
const chalk = require("chalk");
const csv = fs.readFileSync(`./crypto-people-database.csv`);
const { checkDateOverlap } = require("./utils");

var rawData = [];
var rowsUniqByPerson = [];
var rowsUniqByCompany = [];
var personsById = {};
var personsByName = {};
var companiesById = {};
var companiesByName = {};

const main = async () => {
  try {
    rawData = await parse(csv, { columns: true, auto_parse: true });
    getUniqListAndDictOfPersonsAndCompanies();
    assignIdsAndCastValues();
    addPastCompaniesToPersonDict();
  } catch (err) {
    console.log(err);
  }
};

function getUniqListAndDictOfPersonsAndCompanies() {
  rowsUniqByPerson = _.uniqWith(
    rawData,
    (a, b) => a.person_name.toLowerCase() === b.person_name.toLowerCase()
  ).map((row, index) =>
    _.assignIn(row, {
      person_id: index
    })
  );
  rowsUniqByCompany = _.uniqWith(
    rawData,
    (a, b) => a.company_name.toLowerCase() === b.company_name.toLowerCase()
  ).map((row, index) => ({
    company_id: index,
    company_name: row.company_name.toUpperCase(),
    company_type: row.company_type
  }));
  personsById = _.keyBy(rowsUniqByPerson, "person_id");
  companiesById = _.keyBy(rowsUniqByCompany, "companie_id");
  personsByName = _.keyBy(rowsUniqByPerson, "person_name");
  companiesByName = _.keyBy(rowsUniqByCompany, "company_name");
}

function assignIdsAndCastValues() {
  rawData = rawData.map(row => {
    return _.assignIn(row, {
      as_student: row.as_student.toLowerCase() === "true",
      person_id: personsByName[row.person_name].person_id,
      company_id: companiesByName[row.company_name.toUpperCase()].company_id,
      hide_date: !row.start_date && !row.end_date
    });
  });
}

function addPastCompaniesToPersonDict() {
  _.forIn(personsById, (person, personId) => {
    var num_first_degree = 0;
    personId = Number(personId);
    person.companies = _.keyBy(
      _.filter(rawData, row => row.person_id === personId).map(row =>
        _.pick(row, [
          "company_id",
          "start_date",
          "end_date",
          "hide_date",
          "company_type",
          "job_type",
          "company_name"
        ])
      ),
      "company_id"
    );
    _.forIn(person.companies, (company, companyId) => {
      var collegues;
      companyId = Number(companyId);
      collegues = _.filter(
        rawData,
        row =>
          row.company_id === companyId &&
          row.person_id !== personId &&
          checkDateOverlap(
            _.pick(person, ["start_date", "end_date", "hide_date"]),
            _.pick(row, ["start_date", "end_date", "hide_date"])
          )
      );
      num_first_degree = num_first_degree + collegues.length;
    });
    person.num_first_degree = num_first_degree;
  });
}

main();

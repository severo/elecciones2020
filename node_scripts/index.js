const fs = require("fs");
const path = require("path");
const d3 = require("d3");

const dataDir = "../datos/";
const options = [
  "MAS_IPSP",
  "CC",
  "CREEMOS",
  "FPV",
  "PAN_BOL",
  "ADN",
  "LIBRE_21",
  "JUNTOS",
  "VOTO_VALIDO",
  "VOTO_BLANCO",
  "VOTO_NULO",
  "VOTO_EMITIDO",
  "INSCRITOS_HABILITADOS",
];

function getFiles() {
  return fs.readdirSync(dataDir);
}

async function readCsv(file) {
  filePath = path.join(dataDir, file);
  const text = await new Promise((resolve, reject) =>
    fs.readFile(filePath, { encoding: "utf-8" }, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    })
  );
  return d3.csvParse(text);
}

async function writeCsv(data) {
  const text = d3.csvFormat(data);
  await new Promise((resolve, reject) =>
    fs.writeFile("./bydate.csv", text, { encoding: "utf-8" }, function (err) {
      if (err) {
        reject(err);
      }
      resolve();
    })
  );
}

function dateFromName(name) {
  // eg: "20201018_214655.csv"
  const year = +name.slice(0, 4);
  const monthIndex = +name.slice(4, 6) - 1;
  const day = +name.slice(6, 8);
  const hours = +name.slice(9, 11);
  const minutes = +name.slice(11, 13);
  const seconds = +name.slice(13, 15);
  return new Date(year, monthIndex, day, hours, minutes, seconds);
}

async function main() {
  const files = getFiles();

  const data = [];
  data.columns = ["date", ...options];
  for await (const f of files) {
    const mesas = (await readCsv(f)).filter(
      (d) => d["CANDIDATURA"] === "PRESIDENTE"
    );
    const date = dateFromName(f);
    const newElement = { date };
    for (const option of options) {
      newElement[option] = d3.sum(mesas, (d) => d[option]);
    }
    data.push(newElement);
  }

  await writeCsv(data);
}

main();

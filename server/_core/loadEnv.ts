import "dotenv/config";

// Railway's MySQL plugin exposes MYSQL_URL; the old WICK'D service was wired
// with that name. Accept it so pointing the existing service at this repo
// works without renaming the variable.
if (!process.env.DATABASE_URL && process.env.MYSQL_URL) {
  process.env.DATABASE_URL = process.env.MYSQL_URL;
}

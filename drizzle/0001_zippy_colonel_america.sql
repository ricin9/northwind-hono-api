-- Custom SQL migration file, put you code below! --
-- adding full text search for customers table
CREATE VIRTUAL TABLE IF NOT EXISTS CustomerSearch USING fts5(
    CustomerID,
    CompanyName,
    ContactName,
    City,
    Country
);

INSERT INTO
    CustomerSearch
Select
    CustomerID,
    CompanyName,
    ContactName,
    City,
    Country
FROM
    Customers;

CREATE TRIGGER IF NOT EXISTS sync_CustomerSearch_after_insert
AFTER
INSERT
    ON Customers BEGIN
INSERT INTO
    CustomerSearch (
        CustomerID,
        CompanyName,
        ContactName,
        City,
        Country
    )
VALUES
    (
        new.CustomerID,
        new.CompanyName,
        new.ContactName,
        new.City,
        new.Country
    );

END;

CREATE TRIGGER IF NOT EXISTS sync_CustomerSearch_after_update
AFTER
UPDATE
    ON Customers BEGIN
UPDATE
    CustomerSearch
SET
    CompanyName = new.CompanyName,
    ContactName = new.ContactName,
    City = new.City,
    Country = new.Country
WHERE
    CustomerID = new.CustomerID;

END;

CREATE TRIGGER IF NOT EXISTS sync_CustomerSearch_after_delete
AFTER
    DELETE ON Customers BEGIN
DELETE FROM
    CustomerSearch
WHERE
    CustomerID = old.CustomerID;

END;
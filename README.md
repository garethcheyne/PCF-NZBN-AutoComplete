# PCF-NZBN-AutoComplete
Dynamics365 / PowerApps PCF Control to consume the API from https://www.nzbn.govt.nz and auto complete New Zealand registered companies data.

You will need to obtain a token from the https://api.business.govt.nz first.

The auto complete will populate the following data, but seel free to extend this to you needs, personally I only store a minimum about of data using this PCF control, and the rest of the data is populated nightly via a MS Flow that check the status of all companies stored in out Dynamics Instance.

Thoses fieds are.
*nzbnNumber
*companyName
*tradingAs
*statusCode
*statusReason
*registrationDate



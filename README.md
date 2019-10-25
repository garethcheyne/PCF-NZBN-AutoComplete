# PCF-NZBN-AutoComplete
Dynamics365 / PowerApps PCF Control to consume the API from https://www.nzbn.govt.nz and auto complete New Zealand registered companies data.

You will need to obtain a token from the https://api.business.govt.nz first.

The auto complete will populate the following data, but feel free to extend this to your needs, personally I only store a minimum about of data using this PCF control, and the rest of the data is populated nightly via a MS Flow that check the status of all companies stored in our Dynamics Instance.

Thoses fieds are:
* MBIE NZBN#
* Registered Company Name
* Trading As
* Status Code
* Status Reason
* Registration Date
* BIC Code (NZ Statistics Industry Code)



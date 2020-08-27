import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class NZBNAutoComplate implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private localNotifyOutputChanged: () => void;
	private context: ComponentFramework.Context<IInputs>;
	private container: HTMLDivElement;
	private refreshData: EventListenerOrEventListenerObject;

	// input element that is used to create the autocomplete
	private inputElement: HTMLInputElement;

	// Datalist element.
	private datalistElement: HTMLDataListElement;

	private _nzbnToken: string | null;

	private _nzbnNumber: string;
	private _companyName: string;
	private _tradingAs: string;
	private _statusCode: string;
	private _statusReason: string;
	private _registrationDate: Date;
	private _bicCode: string;
	private id: string;	

	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this.localNotifyOutputChanged = notifyOutputChanged;
		this.context = context;
		this._nzbnToken = context.parameters.nzbnToken.raw;

		// @ts-ignore
		this.id = context.parameters.value.attributes.LogicalName;

		// Assinging enviroment vairable.
		this.context = context;
		this.container = document.createElement("div");
		this.inputElement = document.createElement("input");
		this.inputElement.name = "autocomplete_" + this.id
		this.inputElement.placeholder = "---";
		this.inputElement.autocomplete = "off";
		this.inputElement.className = "pcfCustomField"
		this.inputElement.setAttribute("list", "list_" + this.id);


		// Get initial values from field.
		// @ts-ignore
		this.inputElement.value = this.context.parameters.value.formatted

		// Add an eventlistner the element and bind it to a  function.
		this.inputElement.addEventListener("input", this.getSuggestions.bind(this));
						
		// creating HTML elements for data list 
		this.datalistElement = document.createElement("datalist");
		this.datalistElement.id = "list_" + this.id;

		var optionsHTML = "";

		//@ts-ignore 
		this.datalistElement.innerHTML = optionsHTML;
					
		// Appending the HTML elements to the control's HTML container element.
		// Add input element
		this.container.appendChild(this.inputElement);

		//Add datalist element
		this.container.appendChild(this.datalistElement);
		container.appendChild(this.container);	
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		((this._companyName != undefined) ? this.inputElement.value = this._companyName : null)
	}

	public getSuggestions(evt: Event) {

		// Connect to an API and get the suggesstion as user key presses and update dropdown.
		let key = "NZBN"
		let input = (this.inputElement.value as any) as string;
		if (input.indexOf(key) == -1 && input.length > 0)
		{
			this.datalistElement.innerHTML = "";
			let query = "entities?search-term=" + encodeURIComponent(input) + "&page-size=20";
			let options = {
				host: 'api.business.govt.nz/services/v4/nzbn/',
				path: query,
				headers: {
					'accept': 'application/json',
					'authorization': "Bearer " + this._nzbnToken
				}
			}
			const https = require('https');

			https.get(options, (resp: any) => {
				let data = '';			
				// A chunk of data has been recieved.
				resp.on('data', (chunk: any) => {
				data += chunk;
				});		  
				// The whole response has been received. Print out the result.
				resp.on('end', () => {
					var response = JSON.parse(data);
					console.log(response);
					var optionsHTML = "";
					var optionsHTMLArray = new Array();
					for (var i = 0; i < response.items.length; i++) {
					// Build the values for the AutoComplete Array and Add ID for after select use.
						var lastTradingName = ((response.items[i].tradingNames.length > 0) ? this.titleCase(response.items[i].tradingNames[0].name) : this.titleCase(response.items[i].entityName));

						optionsHTMLArray.push('<option value="');
						optionsHTMLArray.push(this.titleCase(response.items[i].entityName) + ". NZBN: " + response.items[i].nzbn);
						optionsHTMLArray.push('">  Status: ' + response.items[i].entityStatusDescription + ', T/A: ' + lastTradingName + '</option>');						
					}
					this.datalistElement.innerHTML = optionsHTMLArray.join("");  
					this.localNotifyOutputChanged  
				});

			}).on("error", (err: { message: string; }) => {
				console.log("Error: " + err.message);
			});		
		}
		else {
			this.getDetails(this.inputElement.value)
		}		
	}

	getDetails(value: string){
		// set the key to lok for in the input that was placed above.
		let key = "NZBN"
		if (value.indexOf(key) > -1){
			let _nzbn = value.substring(value.indexOf(key) + 6, value.length);

			var query = "entities/" + _nzbn;
			var options = {
				host: 'api.business.govt.nz/services/v4/nzbn/',
				path: query,
				headers: {
					'accept': 'application/json',
					'authorization': "Bearer " + this._nzbnToken
				}
			}
	
			const https = require('https');

			https.get(options, (resp: any) => {
				let data = '';
				
				// A chunk of data has been recieved.
				resp.on('data', (chunk: any) => {
				  data += chunk;
				});
			  
				// The whole response has been received. Print out the result.
				resp.on('end', () => {
					var response = JSON.parse(data);
					console.log(response)
					this._nzbnNumber = response.nzbn
					this._companyName = this.titleCase(response.entityName)
					this._tradingAs = (( !Array.isArray(response.tradingNames) || !response.tradingNames.length ) ?  this.titleCase(response.entityName) : this.titleCase(response.tradingNames[0].name))
					this._statusCode = response.entityStatusCode
					this._statusReason = response.entityStatusDescription
					this._registrationDate = response.registrationDate
					this._bicCode = (( !Array.isArray(response.industryClassifications) || !response.industryClassifications.length ) ? null : response.industryClassifications[0].classificationCode)
					this.localNotifyOutputChanged();

				});

			}).on("error", (err: { message: string; }) => {
				console.log("Error: " + err.message);
			});		
		}
		else {
			console.log("setSelected :: No " + key);
			return {};
		}	

	}

	public titleCase(s: string) {
		let str = s.toLowerCase().split(' ');
		let final = [];
		for (let word of str) {
			final.push(word.charAt(0).toUpperCase() + word.slice(1));
		}
		return final.join(' ');
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{

		return {
			value: this._companyName,
			nzbnNumber: this._nzbnNumber,
			companyName: this._companyName,
			tradingAs: this._tradingAs,
			statusCode: this._statusCode,
			statusReason: this._statusReason,
			registrationDate: this._registrationDate,
			bicCode: this._bicCode
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}
}

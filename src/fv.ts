export interface fvType {
  Shortname : string;
  // ID : string; This is the key for the object
  Name: string;
  Region: string;
  Web_9_0_Keyboard : string;
  Version: string;
  LanguageID : string;
  LanguageName : string;
}

export interface mobileType {
  // Keys for KeymanMobileUpdates.csv
  Current_Version : string;
  Mobile_Version : string;
  Needs_Update: boolean 
}
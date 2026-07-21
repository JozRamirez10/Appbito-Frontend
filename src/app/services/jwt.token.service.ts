import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtTokenService {

  // jwtToken ! : string;
  // decodedToken ! : {
  //   exp ? : number,
  //   [key : string] : any
  // };
  private jwtToken : string | null = null;

  constructor() { }

  setToken(token : string | null){
    // if(token){
    //   this.jwtToken = token;
    //   sessionStorage.setItem("token", token);
    // }
    this.jwtToken = token;
  }

  getToken() : string | null {
    // return sessionStorage.getItem("token");
    return this.jwtToken;
  }

  decodeToken() {
    // if(this.jwtToken)
    //     this.decodedToken = jwtDecode(this.jwtToken);
    return this.jwtToken ? jwtDecode(this.jwtToken) : null;
  }

  getDecodeToken() {
    // return jwtDecode(this.jwtToken);
    return this.decodeToken();
  }

  getExpiryTime() {
    // this.decodeToken();
    // return this.decodedToken ? this.decodedToken.exp : null;
    const decoded = this.decodeToken();
    return decoded?.exp ?? null;
  }

  isTokenExpired() : boolean {
    // const expiryTime = this.getExpiryTime();
    // if(expiryTime){
    //   return ((1000 * expiryTime) - (new Date()).getTime()) < 5000; 
    // }else{
    //   return false;
    // }
    const expiry = this.getExpiryTime();
    return expiry ? (1000 * expiry) - Date.now() < 5000 : false;
  }

}

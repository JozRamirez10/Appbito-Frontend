import { Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtTokenService {

  private jwtToken : string | null = null;

  setToken(token : string | null) : void {
    this.jwtToken = token;
  }

  getToken() : string | null {
    return this.jwtToken;
  }

  getDecodeToken<T = JwtPayload>() : T | null {

    if (!this.jwtToken) return null;

    try {
      return jwtDecode<T>(this.jwtToken);
    } catch (error) {
      return null;
    }
  }

  getExpiryTime() {
    const decoded = this.getDecodeToken<JwtPayload>();
    return decoded?.exp ?? null;
  }

  isTokenExpired() : boolean {
    const expiry = this.getExpiryTime();

    if (!expiry) return true;

    return (1000 * expiry) - Date.now() < 5000;
  }
}

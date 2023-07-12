import { User } from './user';

export default class AuthenticationUtils {

  static removeUser(): void {
    sessionStorage.removeItem("user");
  }

  static saveUser(user: User) {
    sessionStorage.setItem("user", JSON.stringify(user));
  }

  static getUserFromStorage(): User {
    return <User>JSON.parse(sessionStorage.getItem("user"));
  }

  static hasAnyRole(roles: Array<string>): boolean {
    let hasAnyRole: boolean = false;

    if (!roles || roles.length === 0) {
      hasAnyRole = true;
    } else {
      let user: User = AuthenticationUtils.getUserFromStorage();
      if (user && user.name) {
        let authorities: Array<string> = user.authorities;
        hasAnyRole = authorities.some(res => roles.includes(res))
      }
    }
    return hasAnyRole;
  }

  static hasAllRoles(roles: Array<string>): boolean {
    let hasAllRoles: boolean = false;

    if (!roles || roles.length === 0) {
      hasAllRoles = true;
    } else {
      let user: User = AuthenticationUtils.getUserFromStorage();
      if (user && user.name) {
        let authorities: Array<string> = user.authorities;
        hasAllRoles = roles.every(res => authorities.includes(res))
      }
    }
    return hasAllRoles;
  }

  static hasRole(role: string): boolean {
    let hasRole: boolean = false;

    if (!role) {
      hasRole = true;
    } else {
      let user: User = AuthenticationUtils.getUserFromStorage();
      if (user && user.name) {
        let authorities: Array<string> = user.authorities;
        hasRole = authorities.includes(role);
      }
    }
    return hasRole;
  }

  static isAuthenticated(): boolean {
    let user: User = AuthenticationUtils.getUserFromStorage();
    if (user && user.name) {
      return true;
    }
    return false
  }
}

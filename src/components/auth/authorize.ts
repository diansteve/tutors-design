import { autoinject } from "aurelia-framework";
import { AuthService } from "services/auth-service";

@autoinject
export class Authorize {
  constructor(private auth: AuthService) {
    auth.handleAuthentication();
  }
  async activate(params, route) {}
}

export class ErrorHandler {
  constructor(error, message, redirect) {
    this.error = error;
    this.message = message;
    this.redirect = redirect || '/urls';
  }

  sendError(res) {
    res.send(
      `${this.error}: ${this.message}\n <a href="${this.redirect}">Redirect to ${this.redirect}</a>`
    );
  }

  renderError(res, user) {
    res.status(404).render('urls_error', {
      user,
      error: this.error,
      message: this.message,
    });
  }
}
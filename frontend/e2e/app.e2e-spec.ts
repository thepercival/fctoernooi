import { FcttestPage } from './app.po';

describe('fcttest App', () => {
  let page: FcttestPage;

  beforeEach(() => {
    page = new FcttestPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});

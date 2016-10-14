import { Application } from 'spectron';
import { expect } from 'chai';
import electronPath from 'electron';
import homeStyles from '../app/components/Home.css';
import counterStyles from '../app/components/Counter.css';

const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('main window', function spec() {
  this.timeout(10000);

  before(async () => {
    this.app = new Application({
      path: electronPath,
      args: ['.'],
    });
    return this.app.start();
  });

  after(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  const findCounter = () => this.app.client.element(`.${counterStyles.counter}`);

  const findButtons = async () => {
    const { value } = await this.app.client.elements(`.${counterStyles.btn}`);
    return value.map(btn => btn.ELEMENT);
  };

  it('should open window', async () => {
    const { client, browserWindow } = this.app;

    await client.waitUntilWindowLoaded();
    await delay(500);
    const title = await browserWindow.getTitle();
    expect(title).to.equal('Hello Electron React!');
  });
});

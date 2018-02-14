import { Application } from 'spectron';
import { expect } from 'chai';
import electronPath from 'electron';
import path from 'path';

const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('main window', function spec() {
  this.timeout(10000);

  before(async () => {
    this.app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '../app')]
    });
    return this.app.start();
  });

  after(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it('should open window', async () => {
    const { client, browserWindow } = this.app;

    await client.waitUntilWindowLoaded();
    await delay(500);
    const title = await browserWindow.getTitle();
    expect(title).to.equal('Electrode Over the Air');
  });
});

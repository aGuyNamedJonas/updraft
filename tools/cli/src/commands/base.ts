import Command, {flags} from '@oclif/command'
import * as chalk from 'chalk'

export default abstract class extends Command {
  async init() {
    console.log(chalk.green('*** Base class called'))
  }
  async catch(err) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err);
  }
  async finally(err) {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(err);
  }
}

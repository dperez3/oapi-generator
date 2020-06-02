import UI from 'console-ui';
const ui = new UI({
  inputStream: process.stdin,
  outputStream: process.stdout,
  errorStream: process.stderr,
  writeLevel: 'INFO', //'DEBUG' | 'INFO' | 'WARNING' | 'ERROR',
  ci: false, //true | false
});

export default ui;

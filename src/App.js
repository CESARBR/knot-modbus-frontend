/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import './App.css';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import SlaveService from './services/Slave';
import SlaveCard from './components/SlaveCard';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderCard: false,
      slaves: [],
      slaveSrv: new SlaveService(),
      openSnack: false,
      messageSnack: ''
    };
  }

  componentDidMount() {
    const { slaveSrv } = this.state;
    slaveSrv.connect();
    this.timer = slaveSrv.on('open', () => {
      console.log('connection opened, listing slaves...');
      this.listSlaves();
    });
    // TODO: if not opened show a message to the user,
    // like to refresh page or a spinner with a timeout to try again
    this.timer = slaveSrv.on('close', () => {
      console.log('connection closed, show feedback');
      this.setState({ renderCard: false });
      this.renderCircularProgress();
      setTimeout(() => {
        console.log('try reconnect...');
        slaveSrv.reconnect();
      }, 1000);
    });
  }

  listSlaves() {
    const { slaveSrv } = this.state;
    slaveSrv.listSlaves()
      .then((slaves) => {
        slaves.forEach((slave) => { slave.expanded = false; });
        this.setState({ renderCard: true, slaves });
        this.monitorSlaves();
      })
      .catch((err) => {
        this.setState({ openSnack: true, messageSnack: err.message, show: true });
      });
  }

  monitorSlaves() {
    const { slaveSrv, slaves } = this.state;

    slaveSrv.on('slaveRemoved', (id) => {
      slaves.splice(slaves.findIndex(slave => slave.id === id), 1);
      this.setState({ slaves });
    });

    slaveSrv.on('slaveAdded', (slave) => {
      if (!slaves.some(slv => slv.id === slave.id)) {
        slave.expanded = false;
        slaves.push(slave);
        this.setState({ slaves });
      }
    });

    slaveSrv.on('slaveUpdated', ({ id, properties }) => {
      const slave = slaves.find(slv => slv.id === Number(id));
      if (slave) {
        Object.assign(slave, properties);
        this.setState({ slaves });
      }
    });

    slaveSrv.on('sourceUpdated', ({ id, addr, properties }) => {
      const slave = slaves.find(slv => slv.id === Number(id));
      if (slave && slave.sources) {
        const source = slave.sources.find(src => src.address === addr);
        Object.assign(source, properties);
        this.setState({ slaves });
      }
    });
  }

  async renderSources(slaveId) {
    const { slaves, slaveSrv } = this.state;
    const slave = slaves.find(slv => slv.id === slaveId);
    try {
      const sources = await slaveSrv.listSources(slave.id);
      slave.sources = sources;
      slave.expanded = !slave.expanded;
      this.setState({ slaves });
    } catch (err) {
      this.setState({ openSnack: true, messageSnack: err.message });
    }
  }

  renderCardSlaves() {
    const { slaves } = this.state;
    return (
      <Grid container>
        { slaves.map(slave => (
          <SlaveCard key={slave.id} slave={slave} onExpanded={() => this.renderSources(slave.id)} />
        ))
        }
      </Grid>
    );
  }

  renderCircularProgress() {
    return (
      <CircularProgress variant="indeterminate" />
    );
  }

  render() {
    const { renderCard, openSnack, messageSnack } = this.state;
    return (
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              KNoT Modbus
            </Typography>
          </Toolbar>
        </AppBar>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          open={openSnack}
          autoHideDuration={3000}
          onClose={() => this.setState({ openSnack: false })}
          message={messageSnack}
        />

        { renderCard === true ? this.renderCardSlaves() : this.renderCircularProgress() }


      </div>
    );
  }
}

export default App;

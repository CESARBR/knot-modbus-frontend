import React, { Component } from 'react';
import './App.css';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
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

  onClicked() {
    const { slaveSrv } = this.state;
    slaveSrv.listSlaves()
      .then((slaves) => {
        slaves.forEach((slave) => { slave.expanded = false; });
        this.setState({ renderCard: true, slaves });
        this.monitorSlaves();
      })
      .catch((err) => {
        this.setState({ openSnack: true, messageSnack: err.message });
      });
  }

  monitorSlaves() {
    const { slaveSrv, slaves } = this.state;

    slaveSrv.on('slaveRemoved', (id) => {
      slaves.splice(slaves.findIndex(slave => slave.id === id), 1);
      this.setState({ slaves });
    });

    slaveSrv.on('slaveAdded', (slave) => {
      slave.expanded = false;
      slaves.push(slave);
      this.setState({ slaves });
    });

    slaveSrv.on('slaveUpdated', ({ id, properties }) => {
      const slave = slaves.find(slv => slv.id === Number(id));
      if (slave) {
        Object.assign(slave, properties);
        this.setState({ slaves });
      }
    });
  }

  async renderSources(slaveId) {
    const { slaves } = this.state;
    const slave = slaves.find(slv => slv.id === slaveId);
    slave.expanded = !slave.expanded;
    this.setState({ slaves });
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
        <Button className="load-button" onClick={() => this.onClicked()} variant="contained" color="primary">
          Load slaves
        </Button>
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

        { renderCard === true ? this.renderCardSlaves() : null }
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import SlaveService from './services/SlaveService';
import SlaveCard from './components/SlaveCard';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderCard: false,
      slaves: []
    };
  }

  onClicked(slaveSrv) {
    slaveSrv.listSlaves().then((slaves) => {
      this.setState({ renderCard: true });
      this.setState({ slaves: slaves.data });
    });
  }

  renderCardSlaves() {
    const { slaves } = this.state;
    return slaves.map(slave => <SlaveCard key={slave.id} slave={slave} />);
  }

  render() {
    const slaveSrv = new SlaveService();
    const { renderCard } = this.state;
    return (
      <div className="App">
        <Button className="load-button" onClick={() => this.onClicked(slaveSrv)} variant="contained" color="primary">
          Load slaves
        </Button>

        { renderCard === true ? this.renderCardSlaves() : null }
      </div>
    );
  }
}

export default App;

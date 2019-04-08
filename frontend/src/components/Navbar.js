import React, {Component} from 'react';

class Navbar extends Component{
    constructor(props){
        super(props);
        this.state = {

        }
    }

    render() {
        return (
          <div className={'top-navbar'}>
              {/*<img src={"../mark-logo.png"} />*/}
              <strong>MARK</strong>
          </div>
        );
    }
}

export default Navbar;
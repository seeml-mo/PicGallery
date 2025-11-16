import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useParams, useLocation } from 'react-router-dom';

const data = [
    {filename: "cuhk-2013.jpg", year:2013, remarks: "Sunset over CUHK"},
    {filename: "cuhk-2017.jpg", year:2017, remarks: "Brid's-eye view of CUHK"},
    {filename: "sci-2013.jpg", year:2013, remarks: "The CUHK Emblem"},    
    {filename: "shb-2013.jpg", year:2013, remarks: "The Engineering Buildings"},
    {filename: "stream-2009.jpg", year:2009, remarks: "Nature hidden in the campus"}
];

class App extends React.Component{
    render(){
        return(
            <>
                <Title name="CUHK pictures"/>
                <BrowserRouter>
                    <div>
                    <ul>
                        <li>
                        {' '}
                        <Link to="/">Home</Link>{' '}
                        </li>
                        <li>
                        {' '}
                        <Link to="/images">Images</Link>{' '}
                        </li>
                        <li>
                        <Link to="/slideshow">Slideshow</Link>{' '}
                        </li>
                        <li>
                        <Link to="/imageediting">ImageEditing</Link>{' '}
                        </li>
                    </ul>
                    </div>

                    <hr />

                    <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/images" element={<Images />} />
                    <Route path="/slideshow" element={<Slideshow />} />
                    <Route path="/imageediting" element={<ImageEditing />} />

                    <Route path="*" element={<NoMatch />} />
                    </Routes>
                </BrowserRouter>

            </>
        )
    }
}

function NoMatch() {
  let location = useLocation();
  return (
    <div>
      <h3>
        {' '}
        No Match for <code>{location.pathname}</code>
      </h3>
    </div>
  );
}

class Home extends React.Component {
  render() {
    return <h2>Home</h2>;
  }
}

class Images extends React.Component {
  render() {
    return (
        <>
            <h2>Images</h2>
            <Gallery/>
        </>
    );
  }
}



class Slideshow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentIndex: 0,
            isPlaying: false,
            interval: 1500,
            showCaption: true,
            temporarilyDisabled: null
        };
        this.timer = null;
    }
    

    startSlideshow = () => {
        if (this.state.isPlaying) return;
        
        console.log('interval: ',this.state.interval);
        this.setState({ isPlaying: true });
        this.timer = setInterval(() => {
            this.setState(prevState => ({
                currentIndex: (prevState.currentIndex + 1) % data.length
            }));
        }, this.state.interval);
    }

    stopSlideshow = () => {
        this.setState({ isPlaying: false });
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    slower = () => {
        this.setState({ temporarilyDisabled: 'slower' });
        this.setState(prevState => ({
            interval: prevState.interval + 200
        }), () => {
            console.log('interval after slower:', this.state.interval);
            this.restartSlideshow();
            setTimeout(() => {
                this.setState({ temporarilyDisabled: null });
            }, 100);
        });
    }

    faster = () => {
        this.setState({ temporarilyDisabled: 'faster' });
        this.setState(prevState => ({
            interval: Math.max(200, prevState.interval - 200)
        }),  () => {
            console.log('interval after faster:', this.state.interval);
            this.restartSlideshow();
            setTimeout(() => {
                this.setState({ temporarilyDisabled: null });
            }, 100);
        });
    }

    toggleCaption = () => {
        this.setState(prevState => ({
            showCaption: !prevState.showCaption
        }));
    }

    restartSlideshow = () => {
        if (this.state.isPlaying) {
             if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
                this.setState(prevState => ({
                    currentIndex: (prevState.currentIndex + 1) % data.length
                }));
            }, this.state.interval);
        }
    }

    componentWillUnmount() {
        this.stopSlideshow();
    }

    shuffle = () => {
        this.setState({ temporarilyDisabled: 'shuffle' });
        
        // Fisher-Yates
        const shuffled = [...data];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        //data order updated
        data.splice(0, data.length, ...shuffled);
        
        this.setState({ 
            currentIndex: 0
        }, () => {
            if (this.state.isPlaying) {
                this.restartSlideshow();
            }
            setTimeout(() => {
                this.setState({ temporarilyDisabled: null });
            }, 100);
        });
    }

    render() {
        const { currentIndex, isPlaying, showCaption } = this.state;
        const currentItem = data[currentIndex];

        const isMinInterval = this.state.interval <= 200;

        return(
        <>
            <h2>Slideshow</h2>
            <div className="controls">
                <button onClick={this.startSlideshow} disabled={isPlaying}>Start slideshow</button>
                <button onClick={this.stopSlideshow} disabled={!isPlaying}>Stop slideshow</button>
                <button onClick={this.slower} disabled={this.state.temporarilyDisabled === 'slower'}>Slower</button>
                <button onClick={this.faster} disabled={isMinInterval|| this.state.temporarilyDisabled === 'faster'}>Faster</button>
                <button onClick={this.shuffle} disabled={this.state.temporarilyDisabled === 'shuffle'}>Shuffle</button>
                <button onClick={this.toggleCaption}> {showCaption ? 'Hide' : 'Show'} Caption</button>       
            </div>

            <div className="slide-content">
                <img src={"/images/"+currentItem.filename} alt={currentItem.remarks} />
                {showCaption && <div>{currentItem.filename}</div>}
            </div>
        </>
    );
  }
}

class ImageEditing extends React.Component {
  render() {
    return <h2>ImageEditing</h2>;
  }
}

class Title extends React.Component {
    render(){
        return(
            <>
                <header className="bg-warning">
                    <h1 className="display-4 text-center">{this.props.name}</h1>
                </header>   
            </>
        )
    }

}

class Gallery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEnterPressed: false
        };
    }

    componentDidMount(){
        this.handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                this.setState({isEnterPressed: true});
                console.log('Enter State:', this.state.isEnterPressed);
            }
        };
        
        this.handleKeyUp = (event) => {
            if (event.key === 'Enter') {
                this.setState({isEnterPressed: false});
                console.log('Enter State:', this.state.isEnterPressed);
            }
        };

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        console.log('EventListener added');
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        console.log('EventListener removed');
    }

    render() {
        console.log('Gallery rendering, isEnterPressed:', this.state.isEnterPressed);
        return (
            <main className="container">
                {data.map((file,index) => <FileCard i={index} key={index} isEnterPressed={this.state.isEnterPressed}/>)}
            </main>
        );
    }
}

class FileCard extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = { 
            selected: -1,
        };
        this.currentHoverIndex = -1; 
    }
    
    handleClick(index) {
        if (this.state.selected !== index) {
            this.setState({ selected: index });
          } else {
            this.setState({ selected: -1 });
          }
        console.log('isHovering in state:',this.state.isHovering);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isEnterPressed !== this.props.isEnterPressed) {
            if (this.currentHoverIndex !== -1) {  
                this.setState({ 
                    selected: this.props.isEnterPressed ? this.currentHoverIndex : -1 
                });
            }
        }
    }
    
    handleMouseEnter = (index) => {
        this.currentHoverIndex = index;
        this.setState({ 
            selected: this.props.isEnterPressed ? index : -1 
        });
    }
    
    handleMouseLeave = (index) => {
        this.currentHoverIndex = -1;
        this.setState({ selected: -1 });
    }

    render() {
        let i = this.props.i;
        console.log('FileCard props:', this.props);
        return (
                <div className="card d-inline-block m-2" onMouseEnter={()=> this.handleMouseEnter(i)} onMouseLeave={()=> this.handleMouseLeave(i)} style={{width:this.state.selected==i ? 400 : 200}}>
                    <img src={"/images/"+data[i].filename} className="w-100" />
                    <div className="card-body">
                        <h6 className="card-title">{data[i].filename}</h6>
                        <p className="card-text">{data[i].year}</p>
                    </div>
                </div>
        );
    }
}

export default App;
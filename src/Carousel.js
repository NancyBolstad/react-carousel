import React, {useState, useEffect, useRef} from 'react';
import './Carousel.css';

const IMG_WIDTH = 300;
const IMG_HEIGHT = 300;
const parentPad = 0;
const VISIBLEIMAGES = 3;
const DURATION = 750;

const Carousel = (props) => {
  const {imgList = [], img_width = IMG_WIDTH, img_height = IMG_HEIGHT, visibleImages = VISIBLEIMAGES, duration = DURATION, autoNext = false, timeForNext = 3000} = props;

  const [currFirstImg, setCurrFirstImg] = useState(0); 
  const [actualFirst, setActualFirst] = useState('');   
  const [visibleItemsProps, setVisibleItemsProps] = useState({ order: [], styles: {}}); 
  const currMiddleImgRef = useRef(0);  
  const intervalRef = useRef(0);  
  const imgDifference = useRef(1); 
  const durationRef = useRef(duration); 

  const parentHeight = img_height + 2 * parentPad;  
  const parentWidth = img_width * 3;  
  const elementsInLeft = Math.ceil(visibleImages / 2);  
  const elementsInRight = visibleImages - elementsInLeft;

  const constructVisibleItemsProps = () => {
    const visibleItemsProps = {}; 
    visibleItemsProps.order = [];
    let curr_center = currFirstImg; 
    let timesToIterate = 0; 
    let zIndex = - elementsInRight; 
    let xTranslate = img_width; 
    let zTranslate = 0; 
    let opacity = 1;
    const division = (img_width * (1.66 / elementsInLeft)); 
    let opacityDivider = (0.7 / elementsInRight); 
    let rightEltCount = elementsInRight;
    let leftEltCount = elementsInLeft; 
    let curr_center_copy = curr_center;
  
    while(timesToIterate < visibleImages ) {
      const styles = {};
      let currImgIndex;
      let currImgIndexOnRight = true; 
      if (timesToIterate < elementsInRight) {
        const nextIndex = curr_center - (rightEltCount);
        currImgIndex = nextIndex > -1 ? nextIndex : imgList.length - Math.abs(nextIndex); 
        opacity = 1 - (opacityDivider * rightEltCount); 
        zTranslate =  -division * rightEltCount;  
        xTranslate = img_width - (division * rightEltCount);  
        rightEltCount--;
      } else {  
        currImgIndexOnRight = false;
        currImgIndex = curr_center_copy;  
        if (curr_center_copy + 1 >= imgList.length) { 
          curr_center_copy = 0;
        } else {
          curr_center_copy++;
        }
        opacity = 1 - (opacityDivider * Math.abs(leftEltCount - (timesToIterate + 1)));
        zTranslate =  - division * Math.abs(leftEltCount - (timesToIterate + 1));
        xTranslate = img_width + division * Math.abs(leftEltCount - (timesToIterate + 1));
      }
     
      styles.transform =  'translateX(' + xTranslate + 'px) translateZ(' +  zTranslate + 'px)';
      styles.opacity = opacity;
      styles.zIndex = currImgIndexOnRight ? zIndex++ : zIndex --; 
      visibleItemsProps.order.push(currImgIndex); 
      visibleItemsProps[currImgIndex] = { styles }; 
      timesToIterate++;
    }
    durationRef.current = actualFirst === '' ? duration : ((duration / imgDifference.current)); 
    setVisibleItemsProps(visibleItemsProps); 
  }


  const changeCenter = ({event, index, large_url }) => {

    const currFirstImgIndex = visibleItemsProps.order.indexOf(currFirstImg);
    const prevIndex = visibleItemsProps.order[currFirstImgIndex - 1];
    const nextIndex = visibleItemsProps.order[currFirstImgIndex + 1];
    if (index !== currFirstImg) {
      if (index === prevIndex || index === nextIndex) { 
        setCurrFirstImg(index);
      } else {
        const val = currFirstImgIndex - visibleItemsProps.order.indexOf(index);
        imgDifference.current = Math.abs(val);  
        setActualFirst(index);
        cycleToNextImage(index);
      }
    } else {
      window.open(large_url); 
    }
  }

  const cycleToNextImage = (actual) => {
    if (visibleItemsProps.order.indexOf(currMiddleImgRef.current) > visibleItemsProps.order.indexOf(actual)) {
      currMiddleImgRef.current = currMiddleImgRef.current - 1 > -1 ? currMiddleImgRef.current - 1 : imgList.length - 1; 
      setCurrFirstImg(currMiddleImgRef.current);
    } else {  
      currMiddleImgRef.current = (currMiddleImgRef.current + 1) < imgList.length ?  (currMiddleImgRef.current + 1) : 0; 
      setCurrFirstImg(currMiddleImgRef.current);
    }
  }

  
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (actualFirst !== '') {
      intervalRef.current = setInterval(() => {
        if (actualFirst !== '' && actualFirst !== currMiddleImgRef.current) { 
          cycleToNextImage(actualFirst);
        } else if (actualFirst !== '' && actualFirst === currMiddleImgRef.current){
          setActualFirst('');
          imgDifference.current = 1;
          clearInterval(intervalRef.current); 
        }
      }, durationRef.current - 100);  
    }
  }, [actualFirst]);


  useEffect(() => {
    constructVisibleItemsProps(); 
    currMiddleImgRef.current = currFirstImg;  
  }, [currFirstImg]);

  useEffect(() => {
    if (autoNext) {
      setInterval(() => {
        const nextImg = currMiddleImgRef.current + 1 < imgList.length ?  currMiddleImgRef.current + 1 : 0;
        setCurrFirstImg(nextImg);
      }, timeForNext);
    }
  }, []);

  const loadCarousel = () => {
    return (
      <ul className="carouselWrapper" style={{ height: parentHeight + 'px', width:  parentWidth + 'px', padding: parentPad + 'px', perspective: '500px'}}>
      {
        imgList.map(({large_url, url, id}, index) => {
          const dn = visibleItemsProps.order.indexOf(index) === -1;
          const styles = visibleItemsProps[index] ? visibleItemsProps[index].styles: {};
          return (
            <li key={id} className={'imgWrap ' + (dn ? 'dn': '')} style={{...styles, position: 'absolute', transition: `all ${durationRef.current}ms linear `}} onClick={(e) => { changeCenter({e, index, large_url})} }>
              <img src={url} alt={'img_' + id } width={img_width} height={img_height}/>
            </li>
          )
        })
      }
      </ul>
    );
  };

  return (
    <React.Fragment>
      {loadCarousel()}
    </React.Fragment>
  );
}
export default Carousel;

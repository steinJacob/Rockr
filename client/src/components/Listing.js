import React, { useEffect, useState, useRef } from 'react';
import { motion, useTransform, useMotionValue, useAnimation } from "framer-motion";
import {Authorization} from '../components/Authorization';

function Listing() {
    const host = process.env.REACT_APP_BACKEND_HOST;
    const [shownImage, setShownImage] = useState([]);
    const [isImgLoaded, setIsImgLoaded] = useState(false);
    const img = new Image();

    img.onload = () => {
        setIsImgLoaded(true); // set use state once image is confirmed to be loaded
    }

    useEffect(() => {
        getNewListing() // on page load, get first listing
    }, []);

    const getNewListing = async () => {
        Authorization();
        setIsImgLoaded(false);

        const imageQuery = {
            token: localStorage.getItem('token'),
            currListing: shownImage[1],
        };
        fetch(host + '/getListing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(imageQuery),
        })
        .then(res => res.json())
        .then(data => {
            console.log([data['imagePath'], data['listingId'], data['creatorUsername'], data['listingName'], data['chairCondition'], data['chairPrice'], data['chairColor']]);
            setShownImage([data['imagePath'], data['listingId'], data['creatorUsername'], data['listingName'], data['chairCondition'], data['chairPrice'], data['chairColor']])
            img.src = data['imagePath']; // set source of image, needed to determine if it is loaded or not
        });
    }

    const imageYes = async () => {
        await getNewListing();
        const matchPayload = {
            token: localStorage.getItem('token'),
            currListing: shownImage[1]
        };
        fetch(host + '/matchedListing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(matchPayload),
        })
        .then(res => res.json());
    }

    const imageNo = async () => {
        await getNewListing();
    }

    const x = useMotionValue(0); // track x value of listing
    const rotate = useTransform(x, [-150, 150], [-19, 19]); // handle rotation of listing
    const transformedOpacityYes = useTransform(x, [0, 200], [0, 1]); // opacity changer during dragging
    const transformedOpacityNo = useTransform(x, [0, -200], [0, 1])
    const controls = useAnimation();

    const handleDragEnd = () => {
        if (x.get() > 150) {
            controls.start({ x: 0, opacity: 0, transition: { duration: 0 } }); // quickly make div invisible and set position back to 0
            imageYes();
        }
        else if (x.get() < -150) {
            controls.start({ x: 0, opacity: 0, transition: { duration: 0 } }); // quickly make div invisible and set position back to 0
            imageNo();
        }
    }

    useEffect(() => { // use effect, will only run when the isImgLoaded useState is changed
        if (isImgLoaded) // make sure image is loaded before making visible
            controls.start({ opacity: 1, transition: { duration: 1 } });
    }, [isImgLoaded])

    const motionRef = useRef(null);

    return (
        <div className = 'listing-section'>
            <motion.div className = "no-div" style = {{
                backgroundImage: 'url("notoggle.png")',
                backgroundSize: "cover",
                backgroundPosition: "right",
                backgroundRepeat: "no-repeat",
                opacity: transformedOpacityNo,
            }}>
            </motion.div>
            <motion.div className = 'listing-grid'
            style = {{
                gridRow: 1,
                gridColumn: 1,
                x,
                rotate,
            }}
            drag={shownImage[0] ==  "AllOut.jpeg" ? false : "x"}
            dragConstraints={{
                left: 0,
                right: 0,
            }}
            animate={controls}
            onDragEnd = {handleDragEnd}
            >
                <img 
                    className = {shownImage[0] == "AllOut.jpeg" ? "listing-image-out" : "listing-image"}
                    draggable = "false"
                    style = {{
                        gridRow: 1,
                        gridColumn: 1,
                    }}
                    src = {shownImage[0]}
                />
                <div className = {shownImage[0] == "AllOut.jpeg" ? "listing-description-hidden" : "listing-description"} style = {{
                    gridRow: 1,
                    gridColumn: 1,
                    backgroundImage: 'url("blackgradient.png")',
                }}>
                    <div className = "listing-name">
                        <h1>{shownImage[3]}</h1>
                    </div>
                    <div className = "listing-details">
                        <h4>${shownImage[5]}&emsp;&emsp;&emsp;{shownImage[4]}&emsp;&emsp;&emsp;{shownImage[6]}</h4>
                    </div>
                </div>
            </motion.div>
            <motion.div className = "yes-div" style = {{
                backgroundImage: 'url("yestoggle.png")',
                backgroundSize: "cover",
                backgroundPosition: "right",
                backgroundRepeat: "no-repeat",
                opacity: transformedOpacityYes,
            }}>
            </motion.div>
        </div>
    );
}

export default Listing;
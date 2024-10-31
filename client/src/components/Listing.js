import React, { useEffect, useState, useRef } from 'react';
import { motion, useTransform, useMotionValue, useAnimation } from "framer-motion";
import {Authorization} from '../components/Authorization';

function Listing() {
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
        fetch('http://localhost:8000/getListing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(imageQuery),
        })
        .then(res => res.json())
        .then(data => {
            setShownImage([data['imagePath'], data['listingId'], data['creatorUsername']])
            img.src = data['imagePath']; // set source of image, needed to determine if it is loaded or not
        });
    }

    const imageYes = async () => {
        await getNewListing();
        const matchPayload = {
            token: localStorage.getItem('token'),
            currListing: shownImage[1]
        };
        fetch('http://localhost:8000/matchedListing', {
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
    const transformedOpacity = useTransform(x, [-150, 0, 150], [0, 1, 0]); // opacity changer during dragging
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
            <motion.div className = 'listing'
            style = {{
                gridRow: 1,
                gridColumn: 1,
                x,
                rotate,
            }}
            drag="x"
            dragConstraints={{
                left: 0,
                right: 0,
            }}
            animate={controls}
            onDragEnd = {handleDragEnd}
            >
                <img 
                    className = "listing-image"
                    draggable = "false"
                    style = {{
                        gridRow: 1,
                        gridColumn: 1,
                    }}
                    src = {shownImage[0]}
                />
                <div style = {{
                    gridRow: 1,
                    gridColumn: 1,
                }}>
                    TEXT
                </div>
            </motion.div>
        </div>
    );
}

export default Listing;
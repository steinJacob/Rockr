import React, { useEffect, useState } from 'react';
import { motion, useTransform, useMotionValue } from "framer-motion";
import {Authorization} from '../components/Authorization';

function Listing() {
    const [pageUpdater, setPageUpdater] = useState(true); // useEffect runs when pageUpdater changes value, listen (it works)
    const [shownImage, setShownImage] = useState([]);

    useEffect(() => {
        Authorization();

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
        });
    }, []);

    const getNewListing = async () => {
        Authorization();

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
        });
        x.set(0);
    }


    const imageYes = async () => {
        //window.location.reload(); // PAGE BREAKS WITHOUT THIS
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

    const x = useMotionValue(0);

    const rotate = useTransform(x, [-150, 150], [-10, 10]);
    const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

    const handleDragEnd = () => {
        if (x.get() > 50) {
            imageYes();
        }
        else if (x.get() < -50) {
            imageNo();
        }
    }

    return (
        <div className = 'listing-section'>
            <motion.div className = 'listing'
            style = {{
                gridRow: 1,
                gridColumn: 1,
                x,
                rotate,
                opacity,
            }}
            drag="x"
            dragConstraints={{
                left: 0,
                right: 0,
            }}
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
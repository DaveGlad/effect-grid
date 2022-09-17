import React, { useRef, useLayoutEffect, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, useAnimation } from "framer-motion";
import styled from "styled-components";
import "./styles.css";

function Grid({ delayPerPixel = 0.002, numItems = 9 }) {
  const originOffset = useRef({ top: 0, left: 0 });
  const controls = useAnimation();

  useEffect(() => {
    controls.start("visible");
  }, []);

  return (
    // We set variants to be an object to force variant propagation - this is a bug
    // with variants and useAnimation()
    // https://github.com/framer/motion/issues/191
    <motion.div initial="hidden" animate={controls} variants={{}}>
      {Array.from({ length: numItems }).map((_, i) => (
        <GridItem
          key={i}
          i={i}
          originIndex={26}
          delayPerPixel={delayPerPixel}
          originOffset={originOffset}
        />
      ))}
    </motion.div>
  );
}

function GridItem({ delayPerPixel, i, originIndex, originOffset }) {
  const delayRef = useRef(0);
  const offset = useRef({ top: 0, left: 0 });
  const ref = useRef();

  // The measurement for all elements happens in the layoutEffect cycle
  // This ensures that when we calculate distance in the effect cycle
  // all elements have already been measured
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    offset.current = {
      top: element.offsetTop,
      left: element.offsetLeft
    };

    if (i === originIndex) {
      originOffset.current = offset.current;
    }
  }, [delayPerPixel]);

  useEffect(() => {
    const dx = Math.abs(offset.current.left - originOffset.current.left);
    const dy = Math.abs(offset.current.top - originOffset.current.top);
    const d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    delayRef.current = d * delayPerPixel;
  }, [delayPerPixel]);

  return <Box ref={ref} variants={itemVariants} custom={delayRef} />;
}

const itemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.5
  },
  visible: (delayRef) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: delayRef.current }
  })
};

const Box = styled(motion.div)`
  margin: 10px;
  display: inline-block;
  height: 100px;
  width: 100px;
  background-color: white;
  border-radius: 10px;
`;

const rootElement = document.getElementById("root");
ReactDOM.render(<Grid />, rootElement);

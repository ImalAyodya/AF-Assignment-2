import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut', // Change from 'anticipate' to something more gentle
  duration: 0.3 // Reduce duration
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03, // Reduce stagger time
      when: "beforeChildren", // Ensure parent animates first
      delayChildren: 0.2 // Delay children animations
    }
  }
}

const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      className="page-transition-container"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
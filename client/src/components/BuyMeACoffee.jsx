import React from "react";
import { motion } from "framer-motion";
import { CONSTANTS } from "../utils/Constants";

const BuyMeACoffee = () => {

  return (
    <motion.div
      className={`inline-flex w-full`}
      initial={{ scale: 1 }}
      whileHover={{
        scale: 1.03,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10
        }
      }}
      whileTap={{ scale: 0.97 }}
    >
      <a
        className="buyButton w-full bg-itemCardHoverBg text-itemCardHoverText border-itemCardHoverText"
        target="_blank"
        href={CONSTANTS.BuyMeACoffee}
      >
        <img
          className="coffeeImage"
          src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
          alt="Buy me a coffee"
        />
        <span className="coffeeButtonText">Buy me a coffee</span>
      </a>
    </motion.div>
  );
};

const MemoizedComponent = React.memo(BuyMeACoffee);
export default MemoizedComponent;


import React from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";


const GPAFormula: React.FC = () => {
  return (
    <div style={{ textAlign: "center", margin: "1rem" }}>
      <BlockMath math={"GPA = \\frac{\\sum_{i=1}^{n} C_i GP_i}{\\sum_{i=1}^{n} C_i}"} />
    </div>
  );
};

export default GPAFormula;

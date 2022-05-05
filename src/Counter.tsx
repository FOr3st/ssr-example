import React, { useState, useCallback } from "react";

export const Counter = () => {
  const [counter, setCounter] = useState(0);

  const incrementCounter = useCallback(() => {
    setCounter(counter + 1);
  }, [counter]);

  return (
    <div>
      <h1>counter at: {counter}</h1>
      <button onClick={incrementCounter}>+</button>
    </div>
  );
};

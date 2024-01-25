export const basic_style = (timing:number) => `
.adventure p{
  font-family: "Baskerville";
  font-size: 1.1rem;
  line-height: 1.9rem;
}
.adventure .node{
  display: flex;
  flex-direction: column;
  padding-top: 3rem;
  transition: ${timing}ms;
  opacity: 0;
  white-space: pre-wrap
}
.adventure .node.node--show{
  opacity: 1;
}
.adventure .node.node--unplayable{
  pointer-events: none;
  opacity: 0.5;
}
.adventure .node__answers{
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 3rem;
}
.adventure .node__answers{
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 3rem;
}
.adventure .answer{
  cursor: pointer;
  padding: 0.8rem 1rem;
  border: 2px solid rgb(112 110 107);
  border-radius: 0.4rem;
}
.adventure .answer.answer--selected{
  animation: flicker 700ms;
  animation-fill-mode: forwards;
}
.adventure .answer:hover{
  background-color: var(--medium-gray);
}
.adventure .answer--notAvailable{
  opacity: 0.2;
}
.adventure .answer--notAvailable--hidden{
  display: none;
}

@keyframes flicker {
  0% {
    background-color: var(--dark-gray);
  }
  20%{
    background-color: var(--dark-gray);
  }
  21%{
    background-color: unset;
  }
  40%{
    background-color: unset;
  }
  41%{
    background-color: var(--dark-gray);
  }
  60%{
    background-color: var(--dark-gray);
  }
  61% {
    background-color: unset;
  }
  80% {
    background-color: unset;
  }
  81%{
    background-color: var(--dark-gray);
  }
  100%{
    background-color: var(--dark-gray);
  }
}
`

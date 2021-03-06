import React, {useState} from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return(
    <button className = {props.c} onClick = {props.onClick}>
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i, c) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        c={c} //class
        />
    );
  }

  render() {
    const row = 3,
      total = 9;
    const winningRow = this.props.winningRow;
    const boardElements = [];
    for (let i = 0; i < total; ) {
      const boardRow = [];
      for (let j = 0; j < row; j++, i++) {
        if(winningRow.includes(i))
          boardRow.push(this.renderSquare(i, "winner square"));
        else
          boardRow.push(this.renderSquare(i, "square"));
      }
      boardElements.push(<div className="board-row">{boardRow}</div>);
    }
      
    return (
      <div>
        {boardElements}
      </div>
    );
  }
}


function MoveButton(props) {
  return (
    <button
      onClick={() => {
        props.onClick();
      }}
      className={props.moveClicked ? "moveClicked" : "move"}
    >
      {props.desc}
    </button>
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          row: null,
          column: null
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      clicked: false,
      sortOrder: "ascending",
      moveClicked: Array(10).fill(false),
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const row = Math.floor(i / 3 + 1);
    const column = (i % 3) + 1;
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          column: column,
          row: row
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      clicked: true,
      moveClicked: Array(10).fill(false),
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }
  sort(order) {
    this.setState({
      clicked: true,
      sortOrder: order,
    })
  }
  
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const { winner, winningRow } = calculateWinner(current.squares);
    const tie = calculateTie(current.squares);

    let moves = history.map((step, move) => {
      const desc = move
        ? `Go to move #${move}. In the column: ${step.column} and row: ${step.row}`
        : "Go to game start";
      return (
        <li key={move}>
          <MoveButton 
            onClick={() => {
              this.jumpTo(move);
              let moveClicked = Array(10).fill(false);
              moveClicked[move] = true;
              this.setState({
                moveClicked: moveClicked,
              })
            }}
            desc={desc}
            moveClicked = {this.state.moveClicked[move]} 
          />
        </li>
      );
    });
    if(this.state.sortOrder === "descending") {
      moves = moves.reverse();
    }

    if(this.state.clicked) {
      this.setState({
        clicked: false,
        moveClicked: Array(10).fill(false),
      });
    }

    let status;
    if (winner) {
      status = `Winner ${winner}`;
    } 
    else if(tie) {
      status = 'The match is drawn'
    }
    else {
      status = `Next Player ${this.state.xIsNext ? "X" : "O"}`;
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            winningRow={winningRow}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <button className="sort" onClick={() => this.sort("ascending")}>
            Sort by Ascending
          </button>
          <button className="sort" onClick={() => this.sort("descending")}>
            Sort by Descending
          </button>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return ({
        winner: squares[a],
        winningRow: [a, b, c],
      });
    }
  }
  return ({
    winner: null,
    winningRow: [],
  });
}

function calculateTie(squares) {
  let tie = true;
  squares.forEach(element => {
    if(element === null)
      tie = false;
  });
  return tie;
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
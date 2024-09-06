import hh from "hyperscript-helpers";
import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";

// Buttons and card styling
const { div, button, input, form, label, p } = hh(h);

const btnStyle = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded"; //https://tailwindcss.com/docs/installation
const cardStyle = "bg-blue-100 p-8 rounded-lg w-80 h-64 mr-6 mb-6 relative text-black"; //https://tailwindcss.com/docs/installation
const inputCardStyle = "border-2 p-2 w-full mb-4 bg-white rounded-lg shadow-lg"; //https://tailwindcss.com/docs/installation
const editCardStyle = "border-2 border-blue-500 p-4 bg-white rounded-lg shadow-md"; //https://tailwindcss.com/docs/installation

// Model update messages, including ranking
const MSGS = {
  OPEN_FORM: "OPEN_FORM",
  CLOSE_FORM: "CLOSE_FORM",
  ADD_CARD: "ADD_CARD",
  UPDATE_QUESTION: "UPDATE_QUESTION",
  UPDATE_ANSWER: "UPDATE_ANSWER",
  EDIT_CARD: "EDIT_CARD",
  SAVE_CARD: "SAVE_CARD",
  DELETE_CARD: "DELETE_CARD",
  TOGGLE_ANSWER: "TOGGLE_ANSWER",  
  UPDATE_RANKING: "UPDATE_RANKING", 
};

// View function representing the UI
function view(dispatch, model) {
  return div([
    div({ className: "flex" }, [
      button({ className: `${btnStyle} mr-4`, onclick: () => dispatch(MSGS.OPEN_FORM) }, "+ Add Flashcard"),
      model.showForm ? addCardForm(dispatch, model) : null
    ]),
    div({ className: "flex flex-wrap justify-start w-full px-4 mb-4 mt-4 text-blue-600" }, [ //https://tailwindcss.com/docs/installation
    ]),
    // Flashcards are sorted in descending order based on ranking
    div({ className: "flex flex-wrap justify-start" }, //https://tailwindcss.com/docs/installation
      model.cards
        .sort((a, b) => b.ranking - a.ranking) //Chatgpt
        .map((card, index) => cardFormOrView(card, index, dispatch, model))
    )
  ]);
}

// New card or editing form
function addCardForm(dispatch, model) {
  return form({ className: "flex flex-col w-1/2", onsubmit: (e) => handleSubmit(e, dispatch, model) }, [
    input({
      className: inputCardStyle,
      type: "text",
      placeholder: "Question",
      value: model.newQuestion,
      oninput: (e) => dispatch({ type: MSGS.UPDATE_QUESTION, value: e.target.value }),
    }),
    input({
      className: inputCardStyle,
      type: "text",
      placeholder: "Answer",
      value: model.newAnswer,
      oninput: (e) => dispatch({ type: MSGS.UPDATE_ANSWER, value: e.target.value }),
    }),
    div({ className: "flex justify-start" }, [
      button({ className: `${btnStyle} mr-2`, type: "submit" }, "Add Card"),
      button({ className: "bg-blue-300 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded", onclick: () => dispatch(MSGS.CLOSE_FORM) }, "Cancel")//https://tailwindcss.com/docs/installation
    ])
  ]);
}

// Choose to display the card or an editable form
function cardFormOrView(card, index, dispatch, model) {
  if (model.editingCardIndex === index) {
    return editCardForm(dispatch, model, index);
  }
  return seeCardStyle(card, index, dispatch);
}

// Editable card form
function editCardForm(dispatch, model, index) {
  return form({ className: editCardStyle, onsubmit: (e) => handleSubmit(e, dispatch, model) }, [
    input({
      className: "w-full border p-2 rounded mb-2",
      type: "text",
      value: model.newQuestion,
      oninput: (e) => dispatch({ type: MSGS.UPDATE_QUESTION, value: e.target.value }),
    }),
    input({
      className: "w-full border p-2 rounded mb-2",
      type: "text",
      value: model.newAnswer,
      oninput: (e) => dispatch({ type: MSGS.UPDATE_ANSWER, value: e.target.value }),
    }),
    div({ className: "flex justify-between" }, [
      button({ className: `${btnStyle} mr-2`, type: "submit" }, "Save"),
      button({ className: "bg-blue-300 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded", onclick: () => dispatch(MSGS.CLOSE_FORM) }, "Cancel")//https://tailwindcss.com/docs/installation
    ])
  ]);
}

// Card display with edit and delete buttons, answer toggling, and ranking buttons
function seeCardStyle(card, index, dispatch) {
  return div({ className: cardStyle }, [
    button({ className: "absolute top-2 right-2", onclick: () => dispatch({ type: MSGS.DELETE_CARD, index }) }, "❌"),
    button({ className: "absolute top-2 right-10", onclick: () => dispatch({ type: MSGS.EDIT_CARD, card, index }) }, "✏️"),
    p({ className: "font-bold" }, "Question"),
    p({ className: "text-lg mb-2" }, card.question),
    button({
      className: "text-blue-500 hover:underline",
      onclick: () => dispatch({ type: MSGS.TOGGLE_ANSWER, index }) 
    }, card.showAnswer ? "Hide Answer" : "Show Answer"),
    card.showAnswer ? p({ className: "text-lg mb-2" }, card.answer) : null, 
    // Ranking buttons after showing the answer
    div({ className: "flex justify-between mt-4" }, [ 
      button({
        className: `${btnStyle} bg-green-500 hover:bg-green-700 mr-2`,//https://tailwindcss.com/docs/installation
        onclick: () => dispatch({ type: MSGS.UPDATE_RANKING, index, value: 2 }) 
      }, "Great"),
      button({
        className: `${btnStyle} bg-yellow-500 hover:bg-yellow-700 mr-2`,
        onclick: () => dispatch({ type: MSGS.UPDATE_RANKING, index, value: 1 })
      }, "Good"),
      button({
        className: `${btnStyle} bg-red-500 hover:bg-red-700`,
        onclick: () => dispatch({ type: MSGS.UPDATE_RANKING, index, value: 0 }) 
      }, "Bad")
    ]),  
    p({ className: "text-sm mt-4" }, `Ranking: ${card.ranking}`)
  ]);
}

// Handle form submission for adding or saving a card
function handleSubmit(e, dispatch, model) {
  e.preventDefault();
  if (model.newQuestion && model.newAnswer) {
    if (model.editingCardIndex !== null) {
      dispatch({ type: MSGS.SAVE_CARD });
    } else {
      dispatch({ type: MSGS.ADD_CARD });
    }
  }
}

// Update function handling messages, including ranking updates
function update(msg, model) {
  switch (msg.type) {
    case MSGS.OPEN_FORM:
      return {
        ...model,
        showForm: true,
        newQuestion: "",
        newAnswer: "",
        editingCardIndex: null,
      };

    case MSGS.CLOSE_FORM:
      return {
        ...model,
        showForm: false,
        editingCardIndex: null,
      };

    case MSGS.ADD_CARD:
      const newCard = {
        question: model.newQuestion,
        answer: model.newAnswer,
        ranking: 0, 
        showAnswer: false,
      };
      return {
        ...model,
        cards: [...model.cards, newCard],
        showForm: false,
      };

    case MSGS.UPDATE_QUESTION:
      return { ...model, newQuestion: msg.value };

    case MSGS.UPDATE_ANSWER:
      return { ...model, newAnswer: msg.value };

    case MSGS.EDIT_CARD:
      return {
        ...model,
        newQuestion: msg.card.question,
        newAnswer: msg.card.answer,
        editingCardIndex: msg.index,
      };

    case MSGS.SAVE_CARD:
      const updatedCards = model.cards.map((card, i) =>
        i === model.editingCardIndex
          ? { ...card, question: model.newQuestion, answer: model.newAnswer }
          : card
      );
      return {
        ...model,
        cards: updatedCards,
        editingCardIndex: null,
      };

    case MSGS.DELETE_CARD:
      return {
        ...model,
        cards: model.cards.filter((_, i) => i !== msg.index),//Chatgpt
      };

    case MSGS.TOGGLE_ANSWER:  // Toggle show/hide answer
      const cardsWithToggledAnswer = model.cards.map((card, i) =>
        i === msg.index ? { ...card, showAnswer: !card.showAnswer } : card
      );
      return { ...model, cards: cardsWithToggledAnswer };

    case MSGS.UPDATE_RANKING:
      const updatedCardsWithRanking = model.cards.map((card, i) =>
        i === msg.index
          ? { ...card, ranking: msg.value } // Set ranking directly
          : card
      );
      return {
        ...model,
        cards: updatedCardsWithRanking,
      };

    default:
      return model;
  }
}

// Initial model
const initModel = {
  cards: [],
  showForm: false,
  newQuestion: "",
  newAnswer: "",
  editingCardIndex: null,
};

// Root node
const rootNode = document.getElementById("app");

// Initialize the app
app(initModel, update, view, rootNode);

// Function to start the app
function app(initModel, update, view, node) {
  let model = initModel;
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);
  function dispatch(msg) {
    if (typeof msg === 'string') msg = { type: msg };
    model = update(msg, model);
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  }
}

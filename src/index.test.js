const { update, initModel, MSGS } = require('./index');

  test('should handle OPEN_FORM action', () => {
    const model = { ...initModel, showForm: false };
    const updatedModel = update({ type: MSGS.OPEN_FORM }, model);
    expect(updatedModel.showForm).toBe(true);
    expect(updatedModel.newQuestion).toBe('');
    expect(updatedModel.newAnswer).toBe('');
  });

  test('should handle CLOSE_FORM action', () => {
    const model = { ...initModel, showForm: true };
    const updatedModel = update({ type: MSGS.CLOSE_FORM }, model);
    expect(updatedModel.showForm).toBe(false);
    expect(updatedModel.editingCardIndex).toBeNull();
  });

  test('should handle ADD_CARD action', () => {
    const model = { ...initModel, newQuestion: 'New Question', newAnswer: 'New Answer', cards: [] };
    const updatedModel = update({ type: MSGS.ADD_CARD }, model);
    expect(updatedModel.cards.length).toBe(1);
    expect(updatedModel.cards[0].question).toBe('New Question');
    expect(updatedModel.cards[0].answer).toBe('New Answer');
    expect(updatedModel.cards[0].ranking).toBe(0); // Ranking should start at 0
  });

  test('should handle UPDATE_QUESTION action', () => {
    const model = { ...initModel, newQuestion: '' };
    const updatedModel = update({ type: MSGS.UPDATE_QUESTION, value: 'Updated Question' }, model);
    expect(updatedModel.newQuestion).toBe('Updated Question');
  });

  test('should handle UPDATE_ANSWER action', () => {
    const model = { ...initModel, newAnswer: '' };
    const updatedModel = update({ type: MSGS.UPDATE_ANSWER, value: 'Updated Answer' }, model);
    expect(updatedModel.newAnswer).toBe('Updated Answer');
  });

  test('should handle DELETE_CARD action', () => {
    const model = createDefaultModel();
    const updatedModel = update({ type: MSGS.DELETE_CARD, index: 0 }, model);
    expect(updatedModel.cards.length).toBe(0);
  });

  test('should handle TOGGLE_ANSWER action', () => {
    const model = createDefaultModel();
    const updatedModel = update({ type: MSGS.TOGGLE_ANSWER, index: 0 }, model);
    expect(updatedModel.cards[0].showAnswer).toBe(true);
  });

  test('should handle UPDATE_RANKING action', () => {
    const model = createDefaultModel();
    const updatedModel = update({ type: MSGS.UPDATE_RANKING, index: 0, value: 2 }, model);
    expect(updatedModel.cards[0].ranking).toBe(2);
  });

  test('should handle EDIT_CARD action', () => {
    const model = createDefaultModel();
    const cardToEdit = model.cards[0];
    const updatedModel = update({ type: MSGS.EDIT_CARD, card: cardToEdit, index: 0 }, model);
    expect(updatedModel.newQuestion).toBe('Test Question');
    expect(updatedModel.newAnswer).toBe('Test Answer');
    expect(updatedModel.editingCardIndex).toBe(0);
  });

  test('should handle SAVE_CARD action', () => {
    const model = { 
      ...createDefaultModel(),
      newQuestion: 'Edited Question',
      newAnswer: 'Edited Answer',
      editingCardIndex: 0 
    };
    const updatedModel = update({ type: MSGS.SAVE_CARD }, model);
    expect(updatedModel.cards[0].question).toBe('Edited Question');
    expect(updatedModel.cards[0].answer).toBe('Edited Answer');
    expect(updatedModel.editingCardIndex).toBeNull();
  });


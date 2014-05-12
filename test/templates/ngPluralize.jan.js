module.exports = function(model) {
    return div([
        div({count: 'foo', when: "{'one':'1 person','other':'{} people'}"}),
        div({count: 'bar', when: "{'one':'1 person','other':'{} people'}"}),
        div({count: 'baz', when: "{'0':'Nobody','one':'1 person','other':'{} people'}"}),
        div({count: 'foo', offset: 2, when: "{'0':'Nobody','1':'you','2':'you and me','one':'you, me, and 1 other person','other':'you, me, and {} other people'}"}),
        div({count: 'bar', offset: 2, when: "{'0':'Nobody','1':'you','2':'you and me','one':'you, me, and 1 other person','other':'you, me, and {} other people'}"})
    ]);
};
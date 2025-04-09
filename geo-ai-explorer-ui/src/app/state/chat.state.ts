import { v4 as uuidv4 } from 'uuid';
import { createReducer, on, createActionGroup, props, createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatMessage } from '../models/chat.model';
import { MockUtil } from '../mock-util';
import { environment } from '../../environments/environment';

/*
Begin by introducing yourself as a geo-enabled RDF virtual assistant. List the features you are capable of helping the user with, including (but not limited to):
- Finding an object by label, code, location or URI
- Navigating a graph of relationships - for example “What is the total population impacted if channel reach CEMVK_RR_03_ONE_25 floods?”

Finally, end by listing the types and edges inside the dataset.
*/
const initialMessage = `Hello! I'm your geo-enabled RDF virtual assistant, specialized in analyzing spatial and demographic data relationships. Here's what I can help you with:

1. Location-based Queries:
- Find objects by their name, code, or location
- Get detailed information about schools, hospitals, levee areas, and channel reaches
- Explore census tract data and population statistics

2. Relationship Analysis:
- Track water flow patterns through channel reaches
- Identify flood risks and impacted areas
- Analyze school zones and their relationships
- Calculate population impacts from flooding scenarios

3. Spatial Analysis:
- Access geometric data for various features
- Analyze flood zones and leveed areas
- Examine relationships between different geographic entities

The dataset contains interconnected information about:
- Infrastructure: Channel Reaches, Levee Areas, Schools, Hospitals
- Demographics: Census Tracts with population data
- Administrative: School Zones, Leveed Areas
- Property: Real Property data
- Risk Analysis: Flood zones and risk relationships

Key relationships include flood risk assessment, water flow patterns, and population impact analysis, all connected through a robust spatial data structure.
`;

const parseText = (m: ChatMessage): ChatMessage => {

    const message = { ...m }
    message.sections = [];

    const tokens = message.text
        .replaceAll('\n', "<br/>")
        .replaceAll('<br/><br/>', "<br/>")
        .split('<location>')

    tokens.forEach(token => {

        const pattern = /<label>(.*)<\/label><uri>(.*)<\/uri><\/location>(.*)/

        if (pattern.test(token)) {
            const values = pattern.exec(token);
            const label: string = values?.at(1) as string;
            const uri: string = values?.at(2) as string;
            const post: string = values?.at(3) as string;

            // Ensure that the response contains a real URI and wasn't generated with some other
            if (uri.startsWith(environment.basePrefix)) {
                message.sections?.push({ type: 1, text: label, uri: uri })
            }
            else {
                message.sections?.push({ type: 0, text: label, uri: uri })
            }

            message.sections?.push({ type: 0, text: post })
        }
        else {
            message.sections?.push({ type: 0, text: token })
        }
    })

    return message;
}


export const ChatActions = createActionGroup({
    source: 'chat',
    events: {
        'Add Message': props<ChatMessage>(),
        'Update Message': props<ChatMessage>(),
        'setMessageAndSession': props<{ messages: ChatMessage[], sessionId: string }>(),
    },
});

export interface ChatStateModel {
    sessionId: string;
    messages: ChatMessage[];
}

export const initialState: ChatStateModel = {
    messages: [parseText({ id: '1', sender: 'system', text: initialMessage, mappable: false, ambiguous: false, purpose: 'info' })],
    sessionId: uuidv4()
}

// if (environment.mockRequests)
initialState.messages = MockUtil.messages.map(m => parseText(m));


export const chatReducer = createReducer(
    initialState,
    on(ChatActions.addMessage, (state, message) => {

        const messages = [...state.messages];
        messages.push(parseText(message));

        return { ...state, messages }
    }),
    on(ChatActions.updateMessage, (state, message) => {

        const messages = [...state.messages];

        const index = messages.findIndex(m => m.id === message.id)

        if (index != -1) {
            messages[index] = (parseText(message));
            return { ...state, messages }
        }

        return { ...state }
    }),
    on(ChatActions.setMessageAndSession, (state, wrapper) => {
        return { ...state, messages: wrapper.messages, sessionId: wrapper.sessionId }
    }),
);

const selector = createFeatureSelector<ChatStateModel>('chat');

export const getMessages = createSelector(selector, (s) => {
    return s.messages;
});

export const getSessionId = createSelector(selector, (s) => {
    return s.sessionId;
});

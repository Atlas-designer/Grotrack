import { Request, Response } from 'express';
import { resolveHouse } from '../utils/resolveHouse';
import { speak } from '../utils/response';
import { handleAddItem } from './intents/addItem';
import { handleCheckItem } from './intents/checkItem';
import { handleListCompartment } from './intents/listCompartment';
import { handleAddToShoppingList } from './intents/addToShoppingList';
import { handleWhatsExpiring } from './intents/whatsExpiring';
import { handleRemoveItem } from './intents/removeItem';
import { handleClearCompartment } from './intents/clearCompartment';
import { handleCookRecipe } from './intents/cookRecipe';
import { handleCheckRecipe } from './intents/checkRecipe';
import { handleSuggestRecipe } from './intents/suggestRecipe';

/**
 * Main Alexa webhook handler.
 * Verifies the request, resolves the user's house, and dispatches to intent handlers.
 */
export async function handleAlexaRequest(req: Request, res: Response) {
  try {
    const body = req.body;
    const requestType = body?.request?.type;

    // LaunchRequest — user opened the skill
    if (requestType === 'LaunchRequest') {
      return res.json(speak('Opened.', false));
    }

    // SessionEndedRequest — cleanup
    if (requestType === 'SessionEndedRequest') {
      return res.json({ version: '1.0', response: {} });
    }

    // IntentRequest — main handler
    if (requestType === 'IntentRequest') {
      const intentName = body.request.intent?.name;

      // Built-in intents
      if (intentName === 'AMAZON.HelpIntent') {
        return res.json(speak(
          'You can say "add 3 eggs to the fridge", "do I have milk", "what\'s in my pantry", "add bread to my shopping list", or "what\'s expiring soon".',
          false
        ));
      }
      if (intentName === 'AMAZON.CancelIntent' || intentName === 'AMAZON.StopIntent') {
        return res.json(speak('Goodbye!', true));
      }
      if (intentName === 'AMAZON.FallbackIntent') {
        return res.json(speak('Sorry, I didn\'t understand that. Try saying "help" for a list of commands.', false));
      }

      // Custom intents require account linking
      const accessToken = body.session?.user?.accessToken;
      if (!accessToken) {
        return res.json({
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: 'Please link your Grotrack account in the Alexa app first.',
            },
            card: {
              type: 'LinkAccount',
            },
            shouldEndSession: true,
          },
        });
      }

      // Resolve user's active house
      const { uid, houseId } = await resolveHouse(accessToken);

      // Dispatch to intent handlers
      switch (intentName) {
        case 'AddItemIntent':
          return res.json(await handleAddItem(body.request, houseId, uid));
        case 'CheckItemIntent':
          return res.json(await handleCheckItem(body.request, houseId));
        case 'ListCompartmentIntent':
          return res.json(await handleListCompartment(body.request, houseId));
        case 'AddToShoppingListIntent':
          return res.json(await handleAddToShoppingList(body.request, houseId, uid));
        case 'WhatsExpiringIntent':
          return res.json(await handleWhatsExpiring(houseId));
        case 'RemoveItemIntent':
          return res.json(await handleRemoveItem(body.request, houseId));
        case 'ClearCompartmentIntent':
          return res.json(await handleClearCompartment(body.request, houseId));
        case 'CookRecipeIntent':
          return res.json(await handleCookRecipe(body.request, houseId));
        case 'CheckRecipeIntent':
          return res.json(await handleCheckRecipe(body.request, houseId, uid));
        case 'SuggestRecipeIntent':
          return res.json(await handleSuggestRecipe(houseId));
        default:
          return res.json(speak('Sorry, I don\'t know how to handle that yet.'));
      }
    }

    return res.json(speak('Sorry, something went wrong.'));
  } catch (err: any) {
    console.error('Alexa handler error:', err);
    return res.json(speak('Sorry, there was an error. Please try again.'));
  }
}

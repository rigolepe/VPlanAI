import React, { useState, useEffect, Dispatch } from 'react';
import ChatHistory from './ChatHistory';
import AgentSelector from './AgentSelector';
import DataSourceList from './DataSourceList';
import styles from './ChatPanel.module.css';
import { Agent } from '../types/agent';
import { ChatMessage } from '../types/chat';
import { sendMessageWithFunction } from '../services/api';
import { Block, CONCRETE_TYPES, Coordinates2D, Entity, LINE_BASED, POINT_BASED } from '../types/entity';
import Papa from 'papaparse';


interface ChatPanelProps {
  showAgentManager: boolean;
  toggleAgentManager: () => void;
  agents: Agent[];

  changeData: (data: any) => void
  addEntities: (entities: Entity[]) => string
  jsonData: Entity[]
  filteredJsonData: Entity[]
}

const ChatPanel: React.FC<ChatPanelProps> = ({ showAgentManager, toggleAgentManager, agents, jsonData, filteredJsonData, changeData, addEntities }) => {
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // [[1.165495400241849, -0.7517668495839811], [1.086920836656441, -1.020953436445809]]
  const pointCoordsToString = (coords: Coordinates2D): string => {
    return `[${coords[0]},${coords[1]}]`
  }

  const lineCoordsToString = (coords: Coordinates2D[]): string => {
    return `[${coords.map(pointCoordsToString).join(', ')}]`;
  }

  const attributesToExclude = ["attribs", "entities", "coordinates", "linetype", "color", "attribs", "elevation", "flags", "height", "prompt", "id"];

  const slaEntitiesPlat = (entities: Entity[], blockNaam = ""): Entity[] => {
    var platgeslagenBlockEntities: Entity[] = []
    const platgeslagenEntities =
      entities
        .map(entity => {
          if (entity.coordinates) {
            if (POINT_BASED.includes(entity.type)) {
              entity.coordString = pointCoordsToString(entity.coordinates as Coordinates2D);
            } else if (LINE_BASED.includes(entity.type)) {
              entity.coordString = lineCoordsToString(entity.coordinates as Coordinates2D[]);
            }
          }
          if (entity.type === 'BLOCK') {
            const block = (entity as Block)
            platgeslagenBlockEntities = [...platgeslagenBlockEntities, ...slaEntitiesPlat(block.entities, block.block_name)]
            // block.entities = [] // deze moet op undefined gezet worden later, mag niet meer in de CSV komen
          }
          if(blockNaam) entity.block_name = blockNaam
          return entity
        })
    return [...platgeslagenBlockEntities, ...platgeslagenEntities]
  }

  const verwijderBlocks = (entities: Entity[]): Entity[] => {
    return entities.filter(entity => {
      return entity.type !== 'BLOCK' // die moeten er niet meer in
    })
  }

  const filterAttributenWegNaPlatslaan = (entities: Entity[]): Entity[] => {
    return entities
      .map(entity => {
        attributesToExclude.forEach(attr => {
          entity[attr] = undefined;
          delete entity[attr]
        })
        return entity
      })
  }

  const lowLevelDataFilter = (entities: Entity[]): string => {
    // Predefined list of keys to be set to undefined
    // const keysToSetUndefined = ["linetype", "color", "attribs", "elevation", "flags", "height", "prompt", "id", "entities"];
    // // Use JSON.stringify with a custom replacer function
    // const jsonString = JSON.stringify(entities, (key, value) => {
    //   // If the key is in the list, return undefined
    //   if (keysToSetUndefined.includes(key)) {
    //     return undefined;
    //   }
    //   // Otherwise return the original value
    //   return value;
    // });

    // JSON -> CSV 
    // de JSON string gaan we niet meer gebruiken, maar we moeten wel nog de ongebruikte attributen weglaten
    // platgeslagen voorstelling:
    // name?: string; // voor de insert (platgeslagen voorstelling, betekenis: entity hoort onder block met naam name)
    // block_name?: string; // voor de insert (platgeslagen voorstelling, betekent dit is block met naam block_name)
    // weg te laten attributen: 
    // zeker: "attribs", "entities", "coordinates" --> dit zijn de complexe samenstellingen
    // extra:  ["linetype", "color", "attribs", "elevation", "flags", "height", "prompt", "id"]

    const entitiesCopy: Entity[] = JSON.parse(JSON.stringify(entities)) // brute force, om onze brondata niet te impacteren met wat we weggooien 
    const platgeslagen = slaEntitiesPlat(entitiesCopy)
    console.log(`Na platslaan: ${Papa.unparse(platgeslagen)}`)
    const platgeslagenEntities = verwijderBlocks(platgeslagen)
    const platgeslagenEnGefilterdeEntities = filterAttributenWegNaPlatslaan(platgeslagenEntities)


    // // Recursive function to filter attributes
    // const filterAttributes = (obj: any, exclude: string[]): any => {
    //   // Create a new object to avoid mutating the original object
    //   const filteredObj: any = {};

    //   // Iterate through the keys of the object
    //   for (const key in obj) {
    //     if (obj.hasOwnProperty(key)) {
    //       // If the key is an object, recurse into it
    //       if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
    //         // Recursively filter the nested object
    //         filteredObj[key] = filterAttributes(obj[key], exclude);
    //       } else if (!exclude.includes(key)) {
    //         // If the key is not in the exclude list, copy it to the new object
    //         filteredObj[key] = obj[key];
    //       }
    //     }
    //   }

    //   return filteredObj;
    // };

    // Filter the data to exclude unwanted attributes
    // const filteredData = filterAttributes(platgeslagenEntities, attributesToExclude);

    const csv = Papa.unparse(platgeslagenEnGefilterdeEntities);
    // return jsonString
    return csv;
  }

  const uitlegBijDeCsvData: string = "# Our JSON DXF dataset als CSV:\n\nINSERT verwijst naar het invoegen van een BLOCK van entiteiten. Deze blocks zijn gedenormaliseerd in de CSV, wat betekent dat all entities die eenzelfde waarde hebben voor attribuut block_name bij hetzelfde block horen. BLOCKS zijn dus herbruikbare delen van de data die door een INSERT toegevoegd worden.\n\n"

  const handleSendMessage = async () => {
    if (currentAgent && userMessage.trim()) {
      const newMessage: ChatMessage = {
        role: 'user',
        content: userMessage,
      };
      const filteredData = lowLevelDataFilter(filteredJsonData);
      console.log(`csv: ${filteredData}`)
      const dataChatMessage: ChatMessage = {
        role: 'user',
        content: `${uitlegBijDeCsvData}${filteredData}`
      }
      setChatHistory(prev => [...prev, newMessage]);
      setUserMessage('');
      setLoading(true);

      try {
        const response = await sendMessageWithFunction(currentAgent, [dataChatMessage, ...chatHistory, newMessage], '');
        const { assistantMessage, functionCall } = response;
        var functionDescription = ""

        functionDescription = `\n\n${functionCall?.description ?? ""}\n${functionCall?.name ?? ""}`
        const messageContent = assistantMessage.content + functionDescription

        setChatHistory(prev => [...prev, {
          role: 'system',
          content: messageContent,
        } as ChatMessage
        ]);

        // Handle the function call from OpenAI, if present
        if (functionCall) {
          handleFunctionCall(functionCall);
        }

      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFunctionCall = async (functionCall: any) => {
    if (functionCall.name === 'getWeather') {
      const functionArgs = JSON.parse(functionCall.arguments);
      const weatherData = await getWeather(functionArgs.location); // Example function

      // Send the result of the function back to the chat
      const functionResult: ChatMessage = {
        role: 'agent',
        content: `The weather in ${functionArgs.location} is ${weatherData.temperature}°C with ${weatherData.description}.`,
      };
      setChatHistory(prev => [...prev, functionResult]);
    }

    if (functionCall.name === "removeElement") {
      const functionArgs = JSON.parse(functionCall.arguments);
      await removeElement(functionArgs.id); // Example function
    }

    if (functionCall.name === "addEntities") {
      const functionArgs = JSON.parse(functionCall.arguments);
      const entities: Entity[] = functionArgs.entities as Entity[]
      const addResult = addEntities(entities)
      console.log(`Adding AI entities: ${addResult.length}`)
      // Send the result of the function back to the chat
      const functionResult: ChatMessage = {
        role: 'system',
        content: `The result of adding the entities is: ${addResult}.`,
      };
      setChatHistory(prev => [...prev, functionResult]);
    }

  };

  const removeElement = async (id: string) => {
    console.log("called function to delete element: ", id)
  }

  const getWeather = async (location: string) => {
    // This is a mock function to simulate getting weather data
    return {
      location,
      temperature: 25,
      description: 'sunny',
    };
  };

  useEffect(() => {
    if (currentAgent) {
      setChatHistory([]); // Clear chat when switching agents
    }
  }, [currentAgent]);

  return (
    <div className={styles.chatPanel}>
      <AgentSelector agents={agents} onSelectAgent={(agent) => setCurrentAgent(agent)} toggleAgentManager={toggleAgentManager} />
      <ChatHistory history={chatHistory} />
      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Type your message..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
      <DataSourceList changeData={changeData} jsonData={jsonData} />
    </div>
  );
};

export default ChatPanel;

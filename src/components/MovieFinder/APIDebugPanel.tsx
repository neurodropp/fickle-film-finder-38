
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface APIDebugPanelProps {
  apiCalls: {
    openai: {
      input: {
        preferences: any;
      };
      output: {
        searchParameters: any;
      };
    };
    tmdb: {
      searchUrl: string;
      searchParams: any;
      resultsCount: number;
    };
  };
}

const APIDebugPanel = ({ apiCalls }: APIDebugPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-4 p-4 bg-gray-900 rounded-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full mb-2">
            {isOpen ? "Hide API Calls" : "Show API Calls"}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="text-moviefinder-gold font-semibold mb-2">
                Original Search Parameters
              </h3>
              <pre className="bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(apiCalls.openai.input.preferences, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="text-moviefinder-gold font-semibold mb-2">
                OpenAI Translation
              </h3>
              <pre className="bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(apiCalls.openai.output.searchParameters, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="text-moviefinder-gold font-semibold mb-2">
                TMDB API Call Details
              </h3>
              <div className="bg-gray-800 p-2 rounded space-y-2">
                <p>
                  <span className="text-moviefinder-silver">Search URL:</span>{" "}
                  {apiCalls.tmdb.searchUrl}
                </p>
                <p>
                  <span className="text-moviefinder-silver">Parameters:</span>
                </p>
                <pre className="overflow-x-auto">
                  {JSON.stringify(apiCalls.tmdb.searchParams, null, 2)}
                </pre>
                <p>
                  <span className="text-moviefinder-silver">Results Count:</span>{" "}
                  {apiCalls.tmdb.resultsCount}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default APIDebugPanel;

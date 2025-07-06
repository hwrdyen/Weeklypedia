"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit3, Check, X } from "lucide-react";
import { Achievement } from "@/lib/ai";

interface AchievementItemProps {
  achievement: Achievement;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

export function AchievementItem({
  achievement,
  onToggle,
  onUpdate,
  onRemove,
}: AchievementItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(achievement.text);

  const handleSave = () => {
    onUpdate(achievement.id, editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(achievement.text);
    setIsEditing(false);
  };

  return (
    <div className="group flex items-start space-x-3 p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-600/30 transition-all duration-200">
      <div className="flex items-center pt-1">
        <Checkbox
          checked={achievement.selected}
          onCheckedChange={() => onToggle(achievement.id)}
          className="border-slate-500 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
        />
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSave()}
              className="glass-input"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white border-0 rounded-lg"
              >
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500 rounded-lg"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p
              className={`text-sm leading-relaxed ${
                achievement.selected
                  ? "text-slate-200"
                  : "text-slate-400 line-through"
              }`}
            >
              {achievement.text}
            </p>
            {achievement.source && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-violet-500/20 text-violet-300 rounded-md border border-violet-500/30">
                {achievement.source}
              </span>
            )}
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-violet-400 hover:bg-violet-500/20 rounded-lg"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button
            onClick={() => onRemove(achievement.id)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

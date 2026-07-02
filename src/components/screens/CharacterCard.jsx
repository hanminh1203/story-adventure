import { getYouTubeEmbedUrl } from "../../lib/media";
import { UI_TEXT } from "../../uiText";

export default function CharacterCard({ character, isClone = false, onSelect }) {
  const cardClass = isClone ? "character-card character-card-clone" : "character-card";

  return (
    <div
      className={cardClass}
      aria-hidden={isClone ? "true" : undefined}
      style={character.themeColor ? { "--guide-accent": character.themeColor } : undefined}
    >
      <div className="character-video">
        <iframe
          width="100%"
          height="100%"
          src={getYouTubeEmbedUrl(character)}
          title={character.name}
          frameBorder="0"
          allow="autoplay;"
          allowFullScreen
          tabIndex={isClone ? -1 : 0}
        />
      </div>
      <div className="character-info">
        <div className="character-name">{character.name}</div>
        <div className="character-title">{character.title}</div>
      </div>
      <button
        className="btn-accent character-select-btn"
        type="button"
        data-character={character.id}
        tabIndex={isClone ? -1 : 0}
        aria-hidden={isClone ? "true" : undefined}
        onClick={isClone ? undefined : () => onSelect(character.id)}
      >
        {UI_TEXT.SELECT_BUTTON_LABEL}
      </button>
    </div>
  );
}

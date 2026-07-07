import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CharacterCard from "./CharacterCard";

describe("CharacterCard", () => {
  const character = {
    id: "guide-1",
    name: "Ella",
    title: "Explorer",
    youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
    themeColor: "#ff00aa",
  };

  it("renders a selectable preview card", () => {
    const onSelect = vi.fn();
    render(<CharacterCard character={character} onSelect={onSelect} />);

    expect(screen.getByTitle("Ella")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith("guide-1");
  });

  it("omits embeds and selection behaviour for clone cards", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <CharacterCard character={character} isClone previewsEnabled={false} onSelect={onSelect} />
    );

    expect(screen.queryByTitle("Ella")).not.toBeInTheDocument();
    const button = container.querySelector("button");
    expect(button).toHaveAttribute("aria-hidden", "true");
    expect(button).toHaveAttribute("tabindex", "-1");

    fireEvent.click(button);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

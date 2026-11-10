import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import {
  AppAccordion,
  AppAccordionItem,
  AppAccordionTrigger,
  AppAccordionContent,
} from "./app-accordion";

describe("AppAccordion", () => {
  it("renders with default open item", () => {
    render(
      <AppAccordion type="single" defaultValue={["item-1"]}>
        <AppAccordionItem value="item-1">
          <AppAccordionTrigger>Section One</AppAccordionTrigger>
          <AppAccordionContent>Content One</AppAccordionContent>
        </AppAccordionItem>
        <AppAccordionItem value="item-2">
          <AppAccordionTrigger>Section Two</AppAccordionTrigger>
          <AppAccordionContent>Content Two</AppAccordionContent>
        </AppAccordionItem>
      </AppAccordion>
    );

    expect(screen.getByText("Content One")).toBeDefined();
    expect(screen.queryByText("Content Two")).toBeNull();
  });

  it("toggles item open and closed on trigger click", () => {
    render(
      <AppAccordion type="single">
        <AppAccordionItem value="item-1">
          <AppAccordionTrigger>Section One</AppAccordionTrigger>
          <AppAccordionContent>Content One</AppAccordionContent>
        </AppAccordionItem>
      </AppAccordion>
    );

    expect(screen.queryByText("Content One")).toBeNull();

    fireEvent.click(screen.getByText("Section One"));
    expect(screen.getByText("Content One")).toBeDefined();

    fireEvent.click(screen.getByText("Section One"));
    expect(screen.queryByText("Content One")).toBeNull();
  });

  it("in single mode, opening one item closes another", () => {
    render(
      <AppAccordion type="single" defaultValue={["item-1"]}>
        <AppAccordionItem value="item-1">
          <AppAccordionTrigger>Section One</AppAccordionTrigger>
          <AppAccordionContent>Content One</AppAccordionContent>
        </AppAccordionItem>
        <AppAccordionItem value="item-2">
          <AppAccordionTrigger>Section Two</AppAccordionTrigger>
          <AppAccordionContent>Content Two</AppAccordionContent>
        </AppAccordionItem>
      </AppAccordion>
    );

    expect(screen.getByText("Content One")).toBeDefined();
    expect(screen.queryByText("Content Two")).toBeNull();

    fireEvent.click(screen.getByText("Section Two"));
    expect(screen.queryByText("Content One")).toBeNull();
    expect(screen.getByText("Content Two")).toBeDefined();
  });

  it("in multiple mode, multiple items can be open simultaneously", () => {
    render(
      <AppAccordion type="multiple" defaultValue={["item-1"]}>
        <AppAccordionItem value="item-1">
          <AppAccordionTrigger>Section One</AppAccordionTrigger>
          <AppAccordionContent>Content One</AppAccordionContent>
        </AppAccordionItem>
        <AppAccordionItem value="item-2">
          <AppAccordionTrigger>Section Two</AppAccordionTrigger>
          <AppAccordionContent>Content Two</AppAccordionContent>
        </AppAccordionItem>
      </AppAccordion>
    );

    expect(screen.getByText("Content One")).toBeDefined();

    fireEvent.click(screen.getByText("Section Two"));
    expect(screen.getByText("Content One")).toBeDefined();
    expect(screen.getByText("Content Two")).toBeDefined();
  });

  it("sets aria-expanded correctly on triggers", () => {
    render(
      <AppAccordion type="single" defaultValue={["item-1"]}>
        <AppAccordionItem value="item-1">
          <AppAccordionTrigger>Section One</AppAccordionTrigger>
          <AppAccordionContent>Content One</AppAccordionContent>
        </AppAccordionItem>
        <AppAccordionItem value="item-2">
          <AppAccordionTrigger>Section Two</AppAccordionTrigger>
          <AppAccordionContent>Content Two</AppAccordionContent>
        </AppAccordionItem>
      </AppAccordion>
    );

    const trigger1 = screen.getByText("Section One").closest("button")!;
    const trigger2 = screen.getByText("Section Two").closest("button")!;

    expect(trigger1.getAttribute("aria-expanded")).toBe("true");
    expect(trigger2.getAttribute("aria-expanded")).toBe("false");
  });
});

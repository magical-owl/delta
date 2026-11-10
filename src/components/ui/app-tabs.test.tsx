import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { AppTabs, AppTabsList, AppTabsTrigger, AppTabsContent } from "./app-tabs";

describe("AppTabs", () => {
  it("renders default active tab panel", () => {
    render(
      <AppTabs defaultValue="tab1">
        <AppTabsList>
          <AppTabsTrigger value="tab1">Tab 1</AppTabsTrigger>
          <AppTabsTrigger value="tab2">Tab 2</AppTabsTrigger>
        </AppTabsList>
        <AppTabsContent value="tab1">Content 1</AppTabsContent>
        <AppTabsContent value="tab2">Content 2</AppTabsContent>
      </AppTabs>
    );

    expect(screen.getByText("Content 1")).toBeDefined();
    expect(screen.queryByText("Content 2")).toBeNull();
  });

  it("switches active tab on click", () => {
    const handleChange = vi.fn();
    render(
      <AppTabs defaultValue="tab1" onValueChange={handleChange}>
        <AppTabsList>
          <AppTabsTrigger value="tab1">Tab 1</AppTabsTrigger>
          <AppTabsTrigger value="tab2">Tab 2</AppTabsTrigger>
        </AppTabsList>
        <AppTabsContent value="tab1">Content 1</AppTabsContent>
        <AppTabsContent value="tab2">Content 2</AppTabsContent>
      </AppTabs>
    );

    const tab2Btn = screen.getByRole("tab", { name: "Tab 2" });
    fireEvent.click(tab2Btn);

    expect(screen.queryByText("Content 1")).toBeNull();
    expect(screen.getByText("Content 2")).toBeDefined();
    expect(handleChange).toHaveBeenCalledWith("tab2");
  });

  it("navigates tabs using keyboard ArrowRight", () => {
    render(
      <AppTabs defaultValue="tab1">
        <AppTabsList>
          <AppTabsTrigger value="tab1">Tab 1</AppTabsTrigger>
          <AppTabsTrigger value="tab2">Tab 2</AppTabsTrigger>
        </AppTabsList>
        <AppTabsContent value="tab1">Content 1</AppTabsContent>
        <AppTabsContent value="tab2">Content 2</AppTabsContent>
      </AppTabs>
    );

    const tabList = screen.getByRole("tablist");
    const tab1Btn = screen.getByRole("tab", { name: "Tab 1" });
    tab1Btn.focus();

    fireEvent.keyDown(tabList, { key: "ArrowRight" });

    expect(screen.queryByText("Content 1")).toBeNull();
    expect(screen.getByText("Content 2")).toBeDefined();
  });
});

// src/tests/Modal.test.js

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Modal from "../Components/Modal";

describe("Modal Component", () => {
    test("does not render anything when isOpen is false", () => {
        const { queryByText, queryByRole, container } = render(
            <Modal isOpen={false} onClose={() => { }}>
                <div>Child Content</div>
            </Modal>
        );

        // Modal should render null, so no child or close button present
        expect(queryByText("Child Content")).not.toBeInTheDocument();
        expect(queryByRole("button")).not.toBeInTheDocument();
        expect(container.firstChild).toBeNull();
    });

    test("renders overlay, container, children, and close button when isOpen is true", () => {
        const onCloseMock = jest.fn();
        const { getByText, getByRole, container } = render(
            <Modal isOpen={true} onClose={onCloseMock}>
                <div>Modal Body</div>
            </Modal>
        );

        // Overlay div should be the first child
        const overlayDiv = container.firstChild;
        expect(overlayDiv).toBeInTheDocument();
        expect(overlayDiv).toHaveClass("fixed", "inset-0", "bg-black", "bg-opacity-50", "flex", "items-center", "justify-center", "z-50");

        // Inner container should have bg-white class
        const innerDiv = container.querySelector("div.bg-white");
        expect(innerDiv).toBeInTheDocument();
        expect(innerDiv).toHaveClass("bg-white", "p-6", "rounded-2xl", "shadow-xl", "min-w-[300px]", "relative");

        // Child content should be rendered
        expect(getByText("Modal Body")).toBeInTheDocument();

        // Close button should be present
        const closeButton = getByRole("button");
        expect(closeButton).toHaveTextContent("✕");
    });

    test("clicking close button calls onClose exactly once", () => {
        const onCloseMock = jest.fn();
        const { getByRole } = render(
            <Modal isOpen={true} onClose={onCloseMock}>
                <span>Content</span>
            </Modal>
        );

        const closeButton = getByRole("button");
        fireEvent.click(closeButton);

        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
});

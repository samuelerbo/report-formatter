"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Section {
  title: string;
  fields: Record<string, string>;
}

const predefinedFields = {
  "Production Type": "",
  "Net Quantity": "",
  Performance: "",
  "Reject Rate": "",
  "Major Downtime": "",
};

const Home = () => {
  const [sections, setSections] = useState<Section[]>([
    { title: "New Section", fields: { ...predefinedFields } },
  ]);
  const [productionDate, setProductionDate] = useState("");
  const [copied, setCopied] = useState(false);
  const lastSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lastSectionRef.current) {
      lastSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sections]);

  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .replace(/(^\w|\s\w)/g, (char) => char.toUpperCase());
  };

  const handleChange = (sectionIndex: number, key: string, value: string) => {
    setSections((prev) => {
      const updatedSections = [...prev];

      updatedSections[sectionIndex].fields[key] =
        key === "Major Downtime" ? value : value.trim();
      return updatedSections;
    });
  };

  const clearSection = (index: number) => {
    setSections((prev) => {
      const updatedSections = [...prev];
      updatedSections[index] = {
        title: "New Section",
        fields: { ...predefinedFields },
      };
      return updatedSections;
    });
  };

  const deleteSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { title: "New Section", fields: { ...predefinedFields } },
    ]);
  };

  const trimTitleOnBlur = (index: number) => {
    setSections((prev) => {
      const updatedSections = [...prev];
      updatedSections[index].title = updatedSections[index].title.trim();
      return updatedSections;
    });
  };

  const updateTitle = (index: number, title: string) => {
    setSections((prev) => {
      const updatedSections = [...prev];
      updatedSections[index].title = toTitleCase(title);
      return updatedSections;
    });
  };

  const generateMarkdown = () => {
    return (
      `# Production Date: ${productionDate} ${
        productionDate ? "E.C" : "---"
      }\n\n` +
      sections
        .filter(({ fields }) =>
          Object.values(fields).some((value) => value.trim() !== "")
        )
        .map(
          ({ title, fields }) =>
            `## **${title}**\n\n` +
            Object.entries(fields)
              .map(([key, value]) => {
                let suffix = "";
                if (key === "Net Quantity") suffix = " packs";
                if (["Performance", "Reject Rate"].includes(key)) suffix = "%";

                return `🔹 **${key}**: ${
                  value.trim() !== "" ? `**${value}**` + suffix : "***"
                }\n\n`;
              })
              .join("")
        )
        .join("")
    );
  };

  const generateMarkdownUserView = () => {
    return (
      `# Production Date: ${productionDate} ${
        productionDate ? "E.C" : "---"
      }\n\n` +
      sections
        .filter(({ fields }) =>
          Object.values(fields).some((value) => value.trim() !== "")
        )
        .map(
          ({ title, fields }) =>
            `## **${title}**\n\n` +
            Object.entries(fields)
              .map(([key, value]) => {
                let suffix = "";
                if (key === "Net Quantity") suffix = " packs";
                if (["Performance", "Reject Rate"].includes(key)) suffix = "%";

                return ` 🔹 ${key}: ${
                  value.trim() !== "" ? `**${value}**` + suffix : "***\n"
                }\n\n`;
              })
              .join("")
        )
        .join(".\n\n")
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMarkdown()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="p-6 min-h-screen bg-gray-100 flex flex-col md:flex-row gap-6 text-black">
      <div className="w-full md:w-1/2 overflow-auto max-h-[80vh]">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex items-center">
          <h2 className="text-2xl font-semibold mr-4">Production Date:</h2>
          <input
            type="text"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 w-32"
            value={productionDate}
            placeholder="dd/mm/yy"
            required={true}
            onChange={(e) => setProductionDate(e.target.value)}
          />{" "}
          <p className="pl-3"> E.C</p>
        </div>

        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            ref={sectionIndex === sections.length - 1 ? lastSectionRef : null}
            className="bg-white p-6 rounded-lg shadow-md mb-6"
          >
            <input
              type="text"
              className="w-full text-2xl font-semibold mb-4 border rounded-lg px-2 py-1"
              value={section.title}
              onBlur={() => trimTitleOnBlur(sectionIndex)}
              onChange={(e) => updateTitle(sectionIndex, e.target.value)}
            />
            {Object.keys(section.fields).map((key) => (
              <div key={key} className="mb-4 flex items-center">
                <label className="text-gray-700 font-medium w-1/3">{key}</label>
                {key === "Major Downtime" ? (
                  <textarea
                    className="w-2/3 px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 resize-y"
                    value={section.fields[key]}
                    onChange={(e) =>
                      handleChange(sectionIndex, key, e.target.value)
                    }
                    placeholder={`Enter ${key}`}
                  />
                ) : (
                  <input
                    type="text"
                    className="w-2/3 px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                    value={section.fields[key]}
                    onChange={(e) =>
                      handleChange(sectionIndex, key, e.target.value)
                    }
                    placeholder={`Enter ${key}`}
                  />
                )}
              </div>
            ))}
            <button
              className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              onClick={() => clearSection(sectionIndex)}
            >
              Clear
            </button>
            {sectionIndex !== 0 && (
              <button
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 ml-2"
                onClick={() => deleteSection(sectionIndex)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
        <button
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          onClick={addSection}
        >
          Add Section
        </button>
      </div>

      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md overflow-auto max-h-[80vh]">
        <h2 className="text-2xl font-semibold mb-4">Live Markdown Preview</h2>
        <div className="border p-4 bg-gray-50 rounded-lg">
          <ReactMarkdown>{generateMarkdownUserView()}</ReactMarkdown>
        </div>
        <button
          className={`mt-4 px-4 py-2 rounded-lg text-white ${
            copied ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={copyToClipboard}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
};

export default Home;

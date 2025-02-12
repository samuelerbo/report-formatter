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
    { title: "", fields: { ...predefinedFields } },
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
        title: "",
        fields: { ...predefinedFields },
      };
      return updatedSections;
    });
  };

  const deleteSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const isAnySectionEmpty = () => {
    return sections.some((section) =>
      Object.values(section.fields).every((value) => value.trim() === "")
    );
  };

  const isCopyDisabled = () => {
    return (
      !productionDate.trim() ||
      sections.some(
        (section) =>
          !section.title.trim() ||
          Object.values(section.fields).every((value) => value.trim() === "")
      )
    );
  };

  const addSection = () => {
    if (!isAnySectionEmpty()) {
      setSections((prev) => [
        ...prev,
        { title: "", fields: { ...predefinedFields } },
      ]);
    }
  };
  const trimTitleOnBlur = (index: number) => {
    setSections((prev) => {
      const updatedSections = [...prev];
      updatedSections[index].title = updatedSections[index].title.trim();
      return updatedSections;
    });
  };

  const trimTextAreaOnBlur = (sectionIndex: number, key: string) => {
    setSections((prev) => {
      const updatedSections = [...prev];
      updatedSections[sectionIndex].fields[key] =
        updatedSections[sectionIndex].fields[key].trim();
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
      `### Production Date: ${productionDate} ${
        productionDate ? "E.C" : "---"
      }\n\n` +
      sections
        .filter(({ fields }) =>
          Object.values(fields).some((value) => value.trim() !== "")
        )
        .map(
          ({ title, fields }) =>
            `#### ${title}` +
            "\n---------\n" +
            Object.entries(fields)
              .map(([key, value]) => {
                let suffix = "";
                if (key === "Net Quantity") suffix = "packs";
                if (["Performance", "Reject Rate"].includes(key)) suffix = "%";

                return `🔹 **${key}**: ${
                  value.trim() !== ""
                    ? suffix === ""
                      ? `**${value}**`
                      : key === "Net Quantity"
                      ? `**${value} ${suffix}**`
                      : `**${value}${suffix}**`
                    : "***"
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
            `\n## ${
              title ? `**${title}**` : `------- No Title Given ----`
            }\n\n` +
            Object.entries(fields)
              .map(([key, value]) => {
                let suffix = "";
                if (key === "Net Quantity") suffix = " Packs";
                if (["Performance", "Reject Rate"].includes(key)) suffix = "%";

                let formattedValue =
                  value.trim() !== "" ? `**${value}**` + suffix : "***\n";

                if (key === "majorDowntime") {
                  formattedValue = formattedValue.replace(/\n/g, "  \n"); // Adds line breaks in Markdown
                }

                return `${key}: ${formattedValue}\n\n`;
              })
              .join("")
        )
        .join(".\n\n")
    );
  };

  const copyToClipboard = () => {
    if (!isCopyDisabled()) {
      navigator.clipboard.writeText(generateMarkdown()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  return (
    <div className="p-6 min-h-screen bg-gray-100 flex flex-col md:flex-row gap-6 text-black">
      <div className="w-full md:w-1/2 overflow-auto max-h-[90vh]">
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
              placeholder="Enter Title"
              value={section.title}
              onBlur={() => trimTitleOnBlur(sectionIndex)}
              onChange={(e) => updateTitle(sectionIndex, e.target.value)}
            />
            {Object.keys(section.fields).map((key) => (
              <div key={key} className="mb-4 flex flex-col md:flex-row">
                <label className="text-gray-700 font-medium w-full md:w-1/3">
                  {key}
                </label>
                {key === "Major Downtime" ? (
                  <textarea
                    className="md:w-2/3 px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 resize-y"
                    value={section.fields[key]}
                    onChange={(e) => {
                      handleChange(sectionIndex, key, e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    onBlur={() => trimTextAreaOnBlur(sectionIndex, key)}
                    placeholder={`Enter ${key}`}
                  />
                ) : (
                  <input
                    type="text"
                    className="md:w-2/3 px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
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
          className={`mt-4 px-4 py-2 rounded-lg text-white ${
            isAnySectionEmpty()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
          onClick={addSection}
          disabled={isAnySectionEmpty()}
        >
          Add Section
        </button>
      </div>

      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md overflow-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold mb-4">Live Preview</h2>
        <div className="border p-4 bg-gray-50 rounded-lg">
          <ReactMarkdown>{generateMarkdownUserView()}</ReactMarkdown>
        </div>
        <button
          className={`mt-4 px-4 py-2 rounded-lg text-white ${
            isCopyDisabled()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={copyToClipboard}
          disabled={isCopyDisabled()}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
};

export default Home;

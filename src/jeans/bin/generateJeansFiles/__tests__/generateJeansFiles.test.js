import path from "path";
import generateJeansFiles from "../generateJeansFiles";

jest.mock("../../config", () => ({
  relativePathDepth: 9,
}));

describe("absolutePaths", () => {
  it("Should list all absolute paths as part of the project", () => {
    const pathToProject = path.join(__dirname, "testProjects", "absolutePaths");
    generateJeansFiles(pathToProject, dependencyMap => {
      const pathToComponentsFolder = path.join(pathToProject, "components");
      const pathToActionsFolder = path.join(pathToProject, "actions");
      expect(dependencyMap).toEqual({
        [pathToActionsFolder]: ["react"],
        [pathToComponentsFolder]: [
          pathToActionsFolder.split(`${process.cwd()}/`)[1],
        ],
      });
    });
  });
});

describe("ifStatements", () => {
  it("Should list all imports and requires despite if statements in a single file", () => {
    const pathToProject = path.join(__dirname, "testProjects", "ifStatements");
    generateJeansFiles(pathToProject, dependencyMap => {
      expect(dependencyMap).toEqual({ [pathToProject]: ["moment", "react"] });
    });
  });
});

describe("relativePaths", () => {
  it("Should list all relative paths as part of the project", () => {
    const pathToProject = path.join(__dirname, "testProjects", "relativePaths");
    generateJeansFiles(pathToProject, dependencyMap => {
      const pathToComponentsFolder = path.join(pathToProject, "components");
      const pathToActionsFolder = path.join(pathToProject, "actions");
      expect(dependencyMap).toEqual({
        [pathToActionsFolder]: ["react"],
        [pathToComponentsFolder]: [
          pathToActionsFolder.split(`${process.cwd()}/`)[1],
        ],
      });
    });
  });
});

describe("simple", () => {
  it("Should list all requires in a single file", () => {
    const pathToProject = path.join(__dirname, "testProjects", "simple");
    generateJeansFiles(pathToProject, dependencyMap => {
      expect(dependencyMap).toEqual({ [pathToProject]: ["moment", "react"] });
    });
  });
});

describe("simpleImports", () => {
  it("Should list all imports in a single file", () => {
    const pathToProject = path.join(__dirname, "testProjects", "simpleImports");
    generateJeansFiles(pathToProject, dependencyMap => {
      expect(dependencyMap).toEqual({ [pathToProject]: ["moment", "react"] });
    });
  });
});

describe("subfolders", () => {
  it("Should list all subfolders of the project", () => {
    const pathToProject = path.join(__dirname, "testProjects", "subfolders");
    generateJeansFiles(pathToProject, dependencyMap => {
      const pathToComponentsFolder = path.join(pathToProject, "components");
      const pathToActionsFolder = path.join(pathToProject, "actions");
      expect(dependencyMap).toEqual({
        [pathToActionsFolder]: ["react"],
        [pathToComponentsFolder]: ["react"],
        [pathToProject]: [
          pathToActionsFolder.split(`${process.cwd()}/`)[1],
          pathToComponentsFolder.split(`${process.cwd()}/`)[1],
        ],
      });
    });
  });
});

describe("tryCatch", () => {
  it("Should list all requiers in try catch statements of the project", () => {
    const pathToProject = path.join(__dirname, "testProjects", "tryCatch");
    generateJeansFiles(pathToProject, dependencyMap => {
      const pathToRoutesFolder = path.join(pathToProject, "routes");
      expect(dependencyMap).toEqual({
        [pathToRoutesFolder]: ["moment"],
        [pathToProject]: [pathToRoutesFolder.split(`${process.cwd()}/`)[1]],
      });
    });
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  validateFile,
  MAX_BYTES,
  objectPath,
  displayName,
  uploadDocument,
  listDocuments,
  downloadDocument,
  deleteDocument,
  BUCKET,
} from "../src/document-service.js";

const user = "12345678-1234-1234-1234-123456789abc";
const pdf = { name: "sample.pdf", type: "application/pdf", size: 100 };
function clientFor(methods) {
  return {
    storage: {
      from(bucket) {
        assert.equal(bucket, BUCKET);
        return methods;
      },
    },
  };
}

test("rejects absent, empty, unsupported and oversized files before storage", async () => {
  for (const file of [
    null,
    { ...pdf, size: 0 },
    { ...pdf, type: "text/html" },
    { ...pdf, size: MAX_BYTES + 1 },
  ]) {
    await assert.rejects(
      uploadDocument(
        clientFor({
          upload() {
            assert.fail("Must not upload invalid file");
          },
        }),
        user,
        file,
      ),
    );
  }
  assert.doesNotThrow(() => validateFile({ ...pdf, size: MAX_BYTES }));
});

test("object paths cannot insert another folder through a file name", () => {
  const path = objectPath(user, "../../other-user/<bad>.pdf", "unique");
  assert.equal(path.split("/").length, 2);
  assert.ok(path.startsWith(`${user}/unique--`));
  assert.equal(displayName("unique--sample.pdf"), "sample.pdf");
  assert.throws(() => objectPath("../someone", pdf.name));
});

test("uploads into account folder without overwriting and propagates rejection", async () => {
  await uploadDocument(
    clientFor({
      async upload(path, file, options) {
        assert.ok(path.startsWith(`${user}/`));
        assert.equal(file, pdf);
        assert.equal(options.upsert, false);
        return { error: null };
      },
    }),
    user,
    pdf,
  );
  await assert.rejects(
    uploadDocument(
      clientFor({
        async upload() {
          return { error: new Error("RLS denied") };
        },
      }),
      user,
      pdf,
    ),
    /RLS denied/,
  );
});

test("list reads all pages and excludes folder placeholders", async () => {
  const offsets = [];
  const files = await listDocuments(
    clientFor({
      async list(prefix, options) {
        assert.equal(prefix, user);
        offsets.push(options.offset);
        return {
          data:
            options.offset === 0
              ? Array.from({ length: 100 }, (_, i) => ({
                  id: String(i),
                  name: String(i),
                }))
              : [
                  { id: "101", name: "last.pdf" },
                  { id: null, name: "folder" },
                ],
          error: null,
        };
      },
    }),
    user,
  );
  assert.deepEqual(offsets, [0, 100]);
  assert.equal(files.length, 101);
});

test("list failure is not silently presented as an empty folder", async () => {
  await assert.rejects(
    listDocuments(
      clientFor({
        async list() {
          return { error: new Error("Not allowed") };
        },
      }),
      user,
    ),
    /Not allowed/,
  );
});

test("download and delete use authenticated storage calls and expose failures", async () => {
  const path = `${user}/sample.pdf`,
    blob = new Blob(["sample"]);
  assert.equal(
    await downloadDocument(
      clientFor({
        async download(value) {
          assert.equal(value, path);
          return { data: blob, error: null };
        },
      }),
      path,
    ),
    blob,
  );
  await assert.rejects(
    downloadDocument(
      clientFor({
        async download() {
          return { error: new Error("Forbidden") };
        },
      }),
      path,
    ),
    /Forbidden/,
  );
  await deleteDocument(
    clientFor({
      async remove(paths) {
        assert.deepEqual(paths, [path]);
        return { error: null };
      },
    }),
    path,
  );
  await assert.rejects(
    deleteDocument(
      clientFor({
        async remove() {
          return { error: new Error("Delete failed") };
        },
      }),
      path,
    ),
    /Delete failed/,
  );
});

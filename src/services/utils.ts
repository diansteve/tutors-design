import { Lo } from "./lo";
import environment from "../environment";
import * as path from "path";

export function injectCourseUrl(lo: Lo, url) {
  if (lo.route) lo.route = lo.route.replace("{{COURSEURL}}", url);
  if (lo.img) lo.img = lo.img.replace("{{COURSEURL}}", url);
  if (lo.video) lo.video = lo.video.replace("{{COURSEURL}}", url);
  if (lo.pdf) lo.pdf = lo.pdf.replace("{{COURSEURL}}", url);
  if (lo.los) {
    lo.los.forEach(lo => {
      injectCourseUrl(lo, url);
    });
  }
}

function removeLastDirectory(the_url) {
  var the_arr = the_url.split("/");
  the_arr.pop();
  return the_arr.join("/");
}

export function findCourseUrls(labUrl: string): string[] {
  let topicUrl = removeLastDirectory(labUrl);
  if (path.basename(topicUrl).startsWith("unit") && topicUrl.includes("topic")) {
    topicUrl = removeLastDirectory(topicUrl);
  }
  const courseUrl = removeLastDirectory(topicUrl);
  return [courseUrl, topicUrl];
}

export function fixRoutes(lo: Lo) {
  if (environment.pushState && lo.route && lo.route[0] == "#") {
    lo.route = lo.route.slice(1);
  }
  if (environment.pushState && lo.video && lo.video[0] == "#") {
    lo.video = lo.video.slice(1);
  }
}

export function lastSegment(url: string) {
  var parts = url.split("/");
  var lastSegment = parts.pop() || parts.pop();
  return lastSegment;
}

export function getSortedUnits(los: Lo[]) {
  const allUnits = los.filter(lo => lo.type == "unit");
  for (let unit of allUnits) {
    const panelVideos = unit.los.filter(lo => lo.type == "panelvideo");
    const panelTalks = unit.los.filter(lo => lo.type == "paneltalk");
    const standardLos = unit.los.filter(
      lo => lo.type !== "unit" && lo.type !== "panelvideo" && lo.type !== "paneltalk"
    );
    const sortedLos: Lo[] = [];
    sortedLos.push(...panelVideos);
    sortedLos.push(...panelTalks);
    sortedLos.push(...standardLos);
    unit.los = sortedLos;
  }
  return allUnits;
}

export function findLos(los: Lo[], lotype: string): Lo[] {
  let result: Lo[] = [];
  los.forEach(lo => {
    if (lo.type === lotype) {
      result.push(lo);
    }
    if (lo.type == "unit") {
      result = result.concat(findLos(lo.los, lotype));
    }
  });
  return result;
}

export function findVideoLos(los: Lo[]): Lo[] {
  let result: Lo[] = [];
  los.forEach(lo => {
    if (lo.video) {
      result.push(lo);
    }
    if (lo.type == "unit") {
      result = result.concat(findVideoLos(lo.los));
    }
  });
  return result;
}

export function allLos(lotype: string, los: Lo[]) {
  let allLos: Lo[] = [];
  for (let topic of los) {
    allLos = allLos.concat(findLos(topic.los, lotype));
  }
  return allLos;
}

export function allVideoLos(los: Lo[]) {
  let allLos: Lo[] = [];
  for (let topic of los) {
    allLos = allLos.concat(findVideoLos(topic.los));
  }
  return allLos;
}

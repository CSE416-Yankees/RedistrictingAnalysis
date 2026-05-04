GUI-2. Display the current district plan when state is selected (required) (SD)   
After selecting a state either from the map or the dropdown, by default, the user should be shown the current Congressional district plan displayed on the centered state map at a zoom level appropriate to the size and location of the state.   
{  
  "state": {  
    "abbr": "MD",  
    "name": "Maryland",  
    "center": \[-76.7, 39.0\],  
    "zoom": 7  
  },  
  "currentPlan": {  
    "districts": \[  
      {  
        "districtNumber": 1,  
        "precinctIds": \["240010001", "240010002", "240030014"\],  
        "demVotePct": 30.2,  
        "repVotePct": 65.1,  
        "minorityPct": 22.4  
      },  
      {  
        "districtNumber": 2,  
        "precinctIds": \["240050011", "240050012"\],  
        "demVotePct": 58.8,  
        "repVotePct": 39.0,  
        "minorityPct": 41.7  
      }  
    \]  
  }  
}  
Or  
{  
  "state": {  
    "abbr": "MD",  
    "name": "Maryland",  
    "center": \[-76.7, 39.0\],  
    "zoom": 7  
  },  
  "currentPlan": {  
    "precinctToDistrict": {  
      "240010001": 1,  
      "240010002": 1,  
      "240030014": 1,  
      "240050011": 2,  
      "240050012": 2  
    }  
  }  
}

GUI-3. State data summary (required) (SD)   
The data associated with the state will be summarized in response to the user selecting the state and shown concurrently with the map of the state (GUI-2). At a minimum, the summary data will include state population (either total, voting age population, or citizen voting age population), state voter distribution (estimate of Republican and Democratic voting percentage based on 2024 Presidential voting), population of each significant racial/ethnic group in the state,), party control of the redistricting process (if any), and summary of Congressional representatives by party. You may substitute population percentage for population or provide both. The table will contain a summary of the ensembles available for the state. Ensemble data in the table will include the number of district plans in the ensemble and the population equality threshold used in the MCMC computation. The summary table will also contain the measure of rough proportionality for each feasible minority group where the measure is calculated as the percentage of that group’s effective districts divided by that group’s percentage of CVAP. Far any optional ensemble (e.g., compactness constrained), the table will also include additional relevant information.   
{  
  "abbr": "MD",  
  "name": "Maryland",  
  "population": 6177224,  
  "statewideVote": {  
    "demPct": 0.62  
  },  
  "demographicSummaries": \[  
    {  
      "group": "Black",  
      "populationPct": 0.29,  
      "cvapPct": 0.27  
    },  
    {  
      "group": "Hispanic",  
      "populationPct": 0.12,  
      "cvapPct": 0.10  
    },  
    {  
      "group": "Asian",  
      "populationPct": 0.08,  
      "cvapPct": 0.07  
    }  
  \],  
  "redistrictingControl": "Democrat",  
  "representationSummary": {  
    "demSeats": 7  
  },  
  "ensembleSummaries": {  
    "RB": {  
      "planCount": 5000,  
      "populationEqualityThresholdPct": 1.0,  
      "roughProportionality": {  
        "Black": 0.74,  
        "Hispanic": 0.40,  
        "Asian": 0.29  
      }  
    },  
    "VRA": {  
      "planCount": 5000,  
      "populationEqualityThresholdPct": 1.0,  
      "roughProportionality": {  
        "Black": 0.93,  
        "Hispanic": 0.61,  
        "Asian": 0.38  
      }  
    }  
  }  
}

GUI-4. Display demographic heat map by precinct (required) (SD)   
When the user selects a feasible minority group from a drop-down menu, a heat map for the demographic group in the state will be displayed. The monochromatic heat map will show the percentage range of the selected group in each precinct. Choose a number of bins that effectively show the population distribution with bin ranges that are equal. Use bounds that are integer values of population percentage. The map will include a legend that displays the bin ranges and associated colors. To improve readability, you can eliminate any bins that contain no values thereby improving the color separation.   
{  
  "group": "Black",  
  "bins": \[  
    {  
      "bin": 0,  
      "minPct": 0,  
      "maxPct": 9,  
      "color": "\#f7fbff"  
    },  
    {  
      "bin": 1,  
      "minPct": 10,  
      "maxPct": 19,  
      "color": "\#deebf7"  
    },  
    {  
      "bin": 2,  
      "minPct": 20,  
      "maxPct": 29,  
      "color": "\#c6dbef"  
    },  
    {  
      "bin": 3,  
      "minPct": 30,  
      "maxPct": 39,  
      "color": "\#9ecae1"  
    },  
    {  
      "bin": 4,  
      "minPct": 40,  
      "maxPct": 49,  
      "color": "\#6baed6"  
    }  
  \],  
  "precinctBins": {  
    "240010001": 1,  
    "240010002": 3,  
    "240010003": 0,  
    "240010004": 4  
  }  
}

GUI-6. Display Congressional representation table (required) (SD)   
When the user clicks on a screen component selecting district detail (or some other appropriate trigger), a table will be displayed. Each row in the table will contain data for one Congressional district. At a minimum, the data will contain the district number, the representative (for the enacted plan only), the representative’s party, the representative’s racial/ethnic group, and the vote margin as a percentage in the selected recent election. Each row will also contain your calculated effectiveness score and your calibrated effectiveness score for the district.   
{  
  "districtRows": \[  
    {  
      "districtNumber": 1,  
      "representative": "Andy Harris",  
      "party": "Republican",  
      "representativeGroup": "White",  
      "voteMarginPct": 35,  
      "effectivenessScore": 0.42,  
      "calibratedEffectivenessScore": 0.38  
    },  
    {  
      "districtNumber": 2,  
      "representative": "Bennie Thompson",  
      "party": "Democrat",  
      "representativeGroup": "Black",  
      "voteMarginPct": 28,  
      "effectivenessScore": 0.81,  
      "calibratedEffectivenessScore": 0.76  
    }...  
  \]  
}

GUI-8. Compare two district plans on the map (preferred) (SD)   
Compare two district plans by showing both plans on the map. This could be limited to comparing a selected random plan (i.e., interesting) with the enacted plan. The trigger will be some GUI component (e.g., “Compare with enacted” button). Your design approach should allow the user to understand the difference between the two plans.  
{  
"plans": {  
 "enacted": {  
  "precinctToDistrict": {  
  "240010001": 1,  
  "240010002": 1,  
  "240010003": 2,  
  "240010004": 2  
  }  
 },  
 "interestingMax": {  
  "precinctToDistrict": {  
  "240010001": 1,  
  "240010002": 2,  
  "240010003": 2,  
  "240010004": 3  
  }  
 }...  
}

GUI-9. Display Gingles analysis results (required) (SD)   
In response to a user request, display a scatter plot (example below) for each of your states that shows the 2024 precinct-level Presidential election results for each party organized on an x, y axis by percentage of racial/ethnic group in the precinct (x-axis) and party vote share (y-axis). Any of the feasible racial/ethnic groups in the state should be selectable for display. For each precinct, there will be a blue dot for Democratic votes and a red dot for Republican votes. If your state contains many precincts, causing significant dot overlap, you can reduce the number of dots in a way that preserves the intent of the display.  
{  
  "groups": {  
    "Asian": {  
      "points": \[...\],  
      "regression": {  
        "dem": \[...\],  
        "rep": \[...\]  
      }  
    }  
  }  
}

GUI-10. Display the Gingles 2/3 analysis data in a tabular display (preferred)   
For all of the Gingles 2/3 analysis data, a table display of the precinct-by-precinct results will be displayed. Each row will display the data for a precinct including, total population, minority non-white population, Republican votes, and Democratic votes.  
{  
  "rows": \[  
    {  
      "precinctId": "240010001",  
      "precinctName": "Precinct 1",  
      "totalPopulation": 5230,  
      "minorityPopulation": 2145,  
      "republicanVotes": 1320,  
      "democraticVotes": 2875  
    },  
    {  
      "precinctId": "240010002",  
      "precinctName": "Precinct 2",  
      "totalPopulation": 4810,  
      "minorityPopulation": 1730,  
      "republicanVotes": 1540,  
      "democraticVotes": 2410  
    }  
  \]  
}

GUI-12. Display candidate results of Ecological Inference (EI) analysis (required) (SD)   
Display the results of the statewide EI analysis in response to a user GUI request. The user shall have the ability to select the racial/language groups to compare. The results will be shown in a display for each candidate (example below) in which the x-axis represents the percentage of a racial/demographic group in the state that voted for a candidate and the y-axis represents the associated probability value for each x-axis value. You might also display multiple candidates in the chart. You will use this to measure racially polarized voting, so you can use the statewide results for President in 2024\. Display the percentage overlap between the curves for each racial/language group in voting for a particular candidate.  
{  
  "candidateResults": {  
    "Candidate1": {  
      "curves": {  
        "Asian": \[  
          { "x": 0.60, "y": 0.4 },  
          { "x": 0.70, "y": 2.8 },  
          { "x": 0.80, "y": 4.2 }  
        \],  
        "Black": \[  
          { "x": 0.45, "y": 0.8 },  
          { "x": 0.55, "y": 2.1 },  
          { "x": 0.65, "y": 3.7 }  
        \],  
        "Hispanic": \[  
          { "x": 0.35, "y": 0.9 },  
          { "x": 0.45, "y": 2.7 },  
          { "x": 0.55, "y": 3.1 }  
        \]  
      },  
      "overlapPct": {  
        "Asian": {  
          "Black": 0.11,  
          "Hispanic": 0.08  
        },  
        "Black": {  
          "Asian": 0.11,  
          "Hispanic": 0.19  
        },  
        "Hispanic": {  
          "Asian": 0.08,  
          "Black": 0.19  
        }  
      }  
    },  
    "Candidate2": {  
      "curves": {  
        "Asian": \[  
          { "x": 0.10, "y": 0.4 },  
          { "x": 0.20, "y": 1.8 },  
          { "x": 0.30, "y": 3.2 }  
        \],  
        "Black": \[  
          { "x": 0.30, "y": 0.6 },  
          { "x": 0.40, "y": 2.0 },  
          { "x": 0.50, "y": 3.9 }  
        \]  
      },  
      "overlapPct": {  
        "Asian": {  
          "Black": 0.14  
        },  
        "Black": {  
          "Asian": 0.14  
        }  
      }  
    }  
  }  
}

GUI-16. Display ensemble splits in a bar chart (required) (SD)   
Display the race-blind and VRA constrained ensemble results to allow the user to make a comparison. Each display will take the form of a bar chart of Republican/Democratic splits where each bar will show the frequency of a distinct simulated election as \#Republican wins / \#Democratic wins. The range of splits shown should be the range of the union of the two sets of splits (i.e., the range should be the same for both displays, but the *tails omitted if they are zero in both sets*.  
{  
  "districtCount": 8,  
  "splits": \[  
    { "repWins": 0, "demWins": 8, "rbFrequency": 12, "vraFrequency": 3 },  
    { "repWins": 1, "demWins": 7, "rbFrequency": 184, "vraFrequency": 96 },  
    { "repWins": 2, "demWins": 6, "rbFrequency": 921, "vraFrequency": 811 },  
    { "repWins": 3, "demWins": 5, "rbFrequency": 403, "vraFrequency": 557 },  
    { "repWins": 4, "demWins": 4, "rbFrequency": 27, "vraFrequency": 41 },  
    { "repWins": 5, "demWins": 3, "rbFrequency": 6, "vraFrequency": 2 }  
  \]  
} \* should be more rows if non zero in other sets, here \[6,2\], \[7,1\], and \[8,0\] have 0

GUI-17. Display box & whisker data (required) (SD)   
The user will be able to request the display of box & whisker data for each of your ensembles of district plans. The displays will be available for each of the feasible racial/ethnic groups in the state. Dots for each district in the current enacted district plan will be shown in the display (in order of increasing percentage of the minority group or associated display. If there is a proposed district plan awaiting approval (e.g., California), that will also be shown. The display should be sufficient in size to show your largest state and should include a legend and color selection to make the chart easily readable.  
{  
  "ensembles": {  
    "VRA": {  
      "groups": {  
        "Asian": {  
          "orderedBins": \[  
            {  
              "order": 1,  
              "min": 12,  
              "q1": 18,  
              "median": 24,  
              "q3": 30,  
              "max": 37,  
              "enactedDot": 22,  
              "proposedDot": 25  
            },  
            {  
              "order": 2,  
              "min": 15,  
              "q1": 21,  
              "median": 26,  
              "q3": 31,  
              "max": 40,  
              "enactedDot": 24,  
              "proposedDot": 28  
            }  
          \]  
        }  
       “Black”: …  
      }  
    }  
  }  
 “RB”: …  
}

GUI-19. Display an “interesting” district plan (preferred)   
Display on the map one of the interesting plans identified in a SeaWulf use case. The user will be able to select the “interesting” plan from among all the “interesting plans” identified on the SeaWulf. The menu listing all the “interesting plans” should identify the characteristics that make each plan interesting.   
Same as GUI 8

GUI-20. Display VRA impact threshold table (required)   
Display a summary table comparing the race-blind and VRA-constrained ensembles across three legal threshold metrics: the proportion of plans meeting or exceeding the enacted plan's number of effective minority districts for each feasible race, the proportion achieving rough proportionality relative to each feasible minority CVAP share, and the proportion satisfying both conditions jointly. Each row displays the percentage for each ensemble side-by-side, and the table is filtered by feasible race. Side-by-side percentages allow the user to assess how rarely minority representation meets legal calibers by chance in the absence of VRA constraints).  
{  
  "rows": \[  
    {  
      "group": "Black",  
      "enactedThreshold": {  
        "rbPct": 0.18,  
        "vraPct": 0.74  
      },  
      "roughProportionality": {  
        "rbPct": 0.11,  
        "vraPct": 0.63  
      },  
      "jointThreshold": {  
        "rbPct": 0.07,  
        "vraPct": 0.58  
      }  
    },  
    {  
      "group": "Hispanic",  
      "enactedThreshold": {  
        "rbPct": 0.09,  
        "vraPct": 0.41  
      },  
      "roughProportionality": {  
        "rbPct": 0.05,  
        "vraPct": 0.36  
      },  
      "jointThreshold": {  
        "rbPct": 0.03,  
        "vraPct": 0.29  
      }  
    },  
    {  
      "group": "Asian",  
      "enactedThreshold": {  
        "rbPct": 0.02,  
        "vraPct": 0.19  
      },  
      "roughProportionality": {  
        "rbPct": 0.01,  
        "vraPct": 0.14  
      },  
      "jointThreshold": {  
        "rbPct": 0.00,  
        "vraPct": 0.10  
      }  
    }  
  \]  
}

GUI-21. Display minority effectiveness box & whisker data (required)   
Display box & whisker data comparing minority effectiveness across the Race-Blind and VRAConstrained ensembles. For each feasible racial/ethnic group(x-axis), two side-by-side boxes will be shown representing each ensemble, with the y-axis indicating the number of effective districts (0 to N). (Discrepancies between RB and VRA ensemble boxes visually allows the user to assess how rarely minority representation arises by chance in the absence of VRA constraints.)  
{  
  "groups": {  
    "Asian": {  
      "RB": { "min": ..., "q1": ..., "median": ..., "q3": ..., "max": ..., "enacted": ... },  
      "VRA": { "min": ..., "q1": ..., "median": ..., "q3": ..., "max": ..., "enacted": ... }  
    },  
    "Black": { ... }  
  }  
}

GUI-22. Display minority effectiveness ensemble histogram (required)   
Display overlapping histograms comparing the distribution of minority-effective districts across both the race-blind and VRA-constrained ensembles. The x-axis will represent the number of minority-effective districts per plan (e.g., 0 to \# districts in state) and the y-axis will represent the number of plans in the ensemble at each value. (Degree of overlap allows the user to directly compare the shape and spread of both distributions).  
{  
  "districtCount": 8,  
  "groupHistograms": {  
    "Black": {  
      "bins": \[  
        { "effectiveDistricts": 0, "rbFrequency": 12, "vraFrequency": 0 },  
        { "effectiveDistricts": 1, "rbFrequency": 184, "vraFrequency": 41 },  
        { "effectiveDistricts": 2, "rbFrequency": 921, "vraFrequency": 388 },  
        { "effectiveDistricts": 3, "rbFrequency": 403, "vraFrequency": 977 },  
        { "effectiveDistricts": 4, "rbFrequency": 27, "vraFrequency": 594 }  
      \]  
    },  
    "Hispanic": {  
      "bins": \[  
        { "effectiveDistricts": 0, "rbFrequency": 55, "vraFrequency": 9 },  
        { "effectiveDistricts": 1, "rbFrequency": 302, "vraFrequency": 144 },  
        { "effectiveDistricts": 2, "rbFrequency": 611, "vraFrequency": 703 },  
        { "effectiveDistricts": 3, "rbFrequency": 80, "vraFrequency": 290 }  
      \]  
    },  
    "Asian": {  
      "bins": \[  
        { "effectiveDistricts": 0, "rbFrequency": 401, "vraFrequency": 120 },  
        { "effectiveDistricts": 1, "rbFrequency": 522, "vraFrequency": 640 },  
        { "effectiveDistricts": 2, "rbFrequency": 77, "vraFrequency": 240 }  
      \]  
    }  
  }  
}

